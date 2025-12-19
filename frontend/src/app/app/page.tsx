"use client"

import { useState, useCallback } from "react"
import ReactFlow, {
  Node,
  Edge,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from "reactflow"
import "reactflow/dist/style.css"
import axios from "axios"
import dagre from "dagre"
import { Sparkles, ArrowRight, Loader2, BookOpen, Lightbulb, GitBranch, AlignCenter, Move } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/ui/navbar"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Toggle } from "@/components/ui/toggle"
import { useAppStore } from "@/store/useAppStore"
import { WordNode } from "@/components/flow/WordNode"

const nodeTypes = {
  word: WordNode,
}

// Dagre Layout helper
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction: 'TB' | 'LR' = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))

  const isHorizontal = direction === 'LR'
  
  // Settings for the layout to look good
  dagreGraph.setGraph({ 
    rankdir: direction,
    nodesep: 50, // Horizontal separation between nodes
    ranksep: 80, // Vertical separation between ranks
    align: 'DL' // Align to top-left? Or 'UL'? Let's try undefined/default first.
  })

  nodes.forEach((node) => {
    // We need dimensions for dagre.
    // Assuming card size is roughly 140x100 based on CSS
    dagreGraph.setNode(node.id, { width: 140, height: 100 })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    
    // Shift slightly so dagre center point is top-left for ReactFlow?
    // ReactFlow default anchor is top-left (0,0).
    // Dagre node positions are center points.
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - 70, // half width
        y: nodeWithPosition.y - 50, // half height
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}

interface GrammarConcept {
  name: string
  description: string
  related_words: string[]
}

interface PedagogicalData {
  translation: string
  nuance?: string
  concepts: GrammarConcept[]
}

interface AnalysisResponse {
  nodes: {
    id: number
    text: string
    lemma: string
    upos: string
    feats?: string
    head_id: number
    deprel: string
    segments?: string[]
  }[]
  pedagogical_data?: PedagogicalData
}

export default function Dashboard() {
  const { isPro } = useAppStore()
  const [inputText, setInputText] = useState("Il gatto mangia il pesce.")
  const [selectedLang, setSelectedLang] = useState("it")
  const [loading, setLoading] = useState(false)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState<Record<string, unknown> | null>(null)
  const [pedagogicalData, setPedagogicalData] = useState<PedagogicalData | null>(null)
  const [layoutMode, setLayoutMode] = useState<'linear' | 'tree'>('linear')
  const [isDraggable, setIsDraggable] = useState(false)

  // Helper to re-layout current nodes
  const applyLayout = useCallback((mode: 'linear' | 'tree', currentNodes: Node[], currentEdges: Edge[]) => {
    if (mode === 'linear') {
       // Simple linear layout based on ID/index
       const sortedNodes = [...currentNodes].sort((a, b) => parseInt(a.id) - parseInt(b.id))
       return sortedNodes.map((node, index) => ({
         ...node,
         targetPosition: Position.Top,
         sourcePosition: Position.Bottom,
         position: { x: index * 220, y: 100 },
         draggable: isDraggable,
       }))
    } else {
      // Tree layout using Dagre
      const { nodes: layoutedNodes } = getLayoutedElements(currentNodes, currentEdges, 'TB')
      return layoutedNodes.map(node => ({
        ...node,
        draggable: isDraggable,
      }))
    }
  }, [isDraggable])

  const handleLayoutChange = (val: string) => {
    if (!val) return
    const newMode = val as 'linear' | 'tree'
    setLayoutMode(newMode)
    const newNodes = applyLayout(newMode, nodes, edges)
    setNodes(newNodes)
  }

  const toggleDraggable = (pressed: boolean) => {
    setIsDraggable(pressed)
    // Update existing nodes with new draggable state
    setNodes((nds) => nds.map((n) => ({ ...n, draggable: pressed })))
  }

  const handleAnalyze = async () => {
    if (!inputText.trim()) return
    setLoading(true)
    setSelectedNode(null)
    setPedagogicalData(null)

    try {
      // Use relative path to leverage Next.js proxy to avoid CORS/Network issues
      const response = await axios.post<AnalysisResponse>("/api/v1/analyze", {
        text: inputText,
        language: selectedLang,
      })

      const analysis = response.data.nodes
      if (response.data.pedagogical_data) {
        setPedagogicalData(response.data.pedagogical_data)
      }

      // Initial raw nodes
      const rawNodes: Node[] = analysis.map((token) => ({
        id: token.id.toString(),
        type: "word",
        position: { x: 0, y: 0 }, // Will be set by layout
        draggable: isDraggable,
        data: {
          text: token.text,
          lemma: token.lemma,
          upos: token.upos,
          feats: token.feats,
          segments: token.segments,
        },
      }))

      const rawEdges: Edge[] = analysis
        .filter((token) => token.head_id !== 0) // Root has head 0
        .map((token) => ({
          id: `e${token.head_id}-${token.id}`,
          source: token.head_id.toString(),
          target: token.id.toString(),
          label: token.deprel,
          type: "default", // Bezier curve looks better for syntax trees
          animated: false,
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
          style: { stroke: "hsl(var(--primary))", strokeWidth: 2 },
        }))

      // Apply initial layout (use current preference)
      const layoutedNodes = applyLayout(layoutMode, rawNodes, rawEdges)

      setNodes(layoutedNodes)
      setEdges(rawEdges)
    } catch (error) {
      console.error("Analysis failed:", error)
      // In a real app, show toast error
    } finally {
      setLoading(false)
    }
  }

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.data)
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none opacity-20" />
      <Navbar />
      
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden h-[calc(100vh-3.5rem)] relative z-10">
        {/* Sidebar / Input Area */}
        <div className="w-full md:w-1/3 lg:w-1/4 border-r border-border p-6 flex flex-col gap-6 overflow-y-auto bg-slate-900/50 backdrop-blur-sm z-20 shadow-xl">
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Input
            </h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Select value={selectedLang} onValueChange={setSelectedLang}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="it">Italian (it)</SelectItem>
                    <SelectItem value="es">Spanish (es)</SelectItem>
                    <SelectItem value="de">German (de)</SelectItem>
                    <SelectItem value="ru">Russian (ru)</SelectItem>
                    <SelectItem value="tr">Turkish (tr)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sentence</label>
              <textarea
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter text to analyze..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              {!isPro && (
                <p className="text-xs text-muted-foreground">Free plan limited to 10 analyses/day.</p>
              )}
            </div>

            <Button onClick={handleAnalyze} disabled={loading} className="w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
              Analyze
            </Button>
          </div>

          {/* Pedagogical Insights (Teacher's Note) */}
          {pedagogicalData && (
             <div className="space-y-4 border-t border-border pt-6 animate-accordion-down">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-500" />
                Teacher&apos;s Notes
              </h3>
              
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3">
                <div>
                  <p className="text-xs text-emerald-400 font-semibold mb-1">TRANSLATION</p>
                  <p className="text-sm italic text-slate-200">&quot;{pedagogicalData.translation}&quot;</p>
                </div>
                
                {pedagogicalData.nuance && (
                   <div>
                    <p className="text-xs text-emerald-400 font-semibold mb-1">NUANCE</p>
                    <p className="text-xs text-slate-300">{pedagogicalData.nuance}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {pedagogicalData.concepts.map((concept, i) => (
                  <div key={i} className="rounded-lg border border-border bg-background/50 p-3 text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb className="w-3 h-3 text-yellow-400" />
                      <span className="font-semibold text-indigo-300">{concept.name}</span>
                    </div>
                    <p className="text-slate-300 text-xs mb-2 leading-relaxed">{concept.description}</p>
                    {concept.related_words.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {concept.related_words.map((word, j) => (
                          <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {word}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedNode && (
            <div className="space-y-4 border-t border-border pt-6 animate-accordion-down">
              <h3 className="font-semibold text-lg">Node Details</h3>
              <div className="rounded-lg border border-border bg-background p-4 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Word:</span>
                  <span className="font-medium">{String(selectedNode?.text)}</span>
                  
                  <span className="text-muted-foreground">Lemma:</span>
                  <span className="font-medium italic">{String(selectedNode?.lemma)}</span>
                  
                  <span className="text-muted-foreground">POS:</span>
                  <span className="font-mono text-xs bg-secondary px-1 rounded w-fit">{String(selectedNode?.upos)}</span>
                </div>
                
                {!!selectedNode?.feats && (
                  <div className="pt-2 mt-2 border-t border-dashed border-border">
                    <p className="text-xs font-semibold mb-1 text-muted-foreground">Morphology:</p>
                    <div className="flex flex-wrap gap-1">
                      {String(selectedNode.feats).split('|').map((feat: string, i: number) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Visualization Area */}
        <div className="flex-1 bg-slate-950 relative flex flex-col">
          
          {/* Layout Controls */}
          {nodes.length > 0 && (
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-slate-900/80 p-1 rounded-lg border border-border backdrop-blur-sm">
              <Toggle 
                aria-label="Toggle Draggable" 
                pressed={isDraggable} 
                onPressedChange={toggleDraggable}
                className="h-8 w-8 p-0 data-[state=on]:bg-indigo-500/20 data-[state=on]:text-indigo-400"
              >
                <Move className="h-4 w-4" />
              </Toggle>
              <div className="w-px h-4 bg-border mx-1" />
              <ToggleGroup type="single" value={layoutMode} onValueChange={handleLayoutChange}>
                <ToggleGroupItem value="linear" aria-label="Linear View" className="h-8 px-2 text-xs">
                  <AlignCenter className="w-4 h-4 mr-1" />
                  Sentence
                </ToggleGroupItem>
                <ToggleGroupItem value="tree" aria-label="Tree View" className="h-8 px-2 text-xs">
                  <GitBranch className="w-4 h-4 mr-1" />
                  Tree
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          )}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.5}
            maxZoom={2}
            className="bg-slate-950"
            proOptions={{ hideAttribution: true }}
          >
            {/* Removed Background Grid as requested for cleaner look */}
            <Controls showInteractive={false} className="bg-background border-border fill-foreground text-foreground" />
          </ReactFlow>
          
          {nodes.length === 0 && !loading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center space-y-2 p-6 rounded-xl bg-background/80 backdrop-blur border border-border">
                <p className="text-muted-foreground">Enter a sentence and click Analyze to visualize.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
