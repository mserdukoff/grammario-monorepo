"use client"

import { useEffect, useState } from "react"
import ReactFlow, {
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from "reactflow"
import "reactflow/dist/style.css"
import { BookOpen, Lightbulb, ChevronRight, Languages, HelpCircle } from "lucide-react"
import { WordNode } from "@/components/flow/WordNode"
import { cn } from "@/lib/utils"

const nodeTypes = { word: WordNode }

const DEMO_NODES = [
  { id: 1, text: "Il", upos: "DET", feats: "Definite=Def|Gender=Masc|Number=Sing|PronType=Art", lemma: "il", deprel: "det", head_id: 2 },
  { id: 2, text: "gatto", upos: "NOUN", feats: "Gender=Masc|Number=Sing", lemma: "gatto", deprel: "nsubj", head_id: 3 },
  { id: 3, text: "mangia", upos: "VERB", feats: "Mood=Ind|Number=Sing|Person=3|Tense=Pres|VerbForm=Fin", lemma: "mangiare", deprel: "ROOT", head_id: 0 },
  { id: 4, text: "il", upos: "DET", feats: "Definite=Def|Gender=Masc|Number=Sing|PronType=Art", lemma: "il", deprel: "det", head_id: 5 },
  { id: 5, text: "pesce", upos: "NOUN", feats: "Gender=Masc|Number=Sing", lemma: "pesce", deprel: "obj", head_id: 3 },
]

const DEMO_PEDAGOGICAL = {
  translation: "The cat is eating the fish.",
  concepts: [
    {
      name: "Definite Articles",
      description: "Both 'il gatto' and 'il pesce' use the masculine singular definite article 'il'",
      related_words: ["il", "lo", "la"],
    },
    {
      name: "Subject-Verb Agreement",
      description: "The verb 'mangia' agrees with the singular masculine subject 'il gatto'",
      related_words: ["gatto", "mangia"],
    },
  ],
  tips: [
    {
      word: "il",
      question: "Why use 'il' for both 'gatto' and 'pesce'?",
      explanation: "Because both 'gatto' and 'pesce' are masculine singular nouns starting with a consonant. 'Il' is used for masculine singular nouns that begin with most consonants.",
      rule: "Masculine singular nouns use 'il' before consonants",
    },
    {
      word: "mangia",
      question: "Why is the verb in third-person singular form?",
      explanation: "Because 'il gatto' is a third-person singular subject. The verb must agree in person and number with its subject.",
      rule: "Verb conjugation matches subject's person and number",
    },
  ],
}

type TabId = "translation" | "concepts" | "tips"

const TABS: { id: TabId; label: string; icon: typeof Languages }[] = [
  { id: "translation", label: "Translation", icon: Languages },
  { id: "concepts", label: "Key concepts", icon: Lightbulb },
  { id: "tips", label: "Why?", icon: HelpCircle },
]

export function HeroDemoAnalysis() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [activeTab, setActiveTab] = useState<TabId | null>(null)

  useEffect(() => {
    const nodeWidth = 200
    const totalWidth = (DEMO_NODES.length - 1) * nodeWidth
    const startX = -totalWidth / 2

    const flowNodes: Node[] = DEMO_NODES.map((token, index) => ({
      id: token.id.toString(),
      type: "word",
      position: { x: startX + index * nodeWidth, y: 0 },
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      draggable: false,
      connectable: false,
      selectable: false,
      data: {
        text: token.text,
        lemma: token.lemma,
        upos: token.upos,
        feats: token.feats,
      },
    }))

    const flowEdges: Edge[] = DEMO_NODES
      .filter((token) => token.head_id !== 0)
      .map((token) => ({
        id: `e${token.head_id}-${token.id}`,
        source: token.head_id.toString(),
        target: token.id.toString(),
        label: token.deprel,
        type: "smoothstep",
        animated: false,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: "var(--primary)", strokeWidth: 1.5, opacity: 0.5 },
      }))

    setNodes(flowNodes)
    setEdges(flowEdges)
  }, [setNodes, setEdges])

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="border-b border-border px-6 py-4 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-border" />
          <div className="w-3 h-3 rounded-full bg-border" />
          <div className="w-3 h-3 rounded-full bg-border" />
        </div>
        <span className="text-lg text-muted-foreground font-mono">Il gatto mangia il pesce.</span>
      </div>

      <div className="h-[280px] md:h-[340px] relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2, minZoom: 0.85 }}
          minZoom={0.6}
          maxZoom={2}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          proOptions={{ hideAttribution: true }}
          className="bg-transparent pointer-events-none"
        />
      </div>

      <div className="border-t border-border">
        <div className="px-6 py-3 flex items-center gap-3 border-b border-border">
          <BookOpen className="w-4.5 h-4.5 text-primary shrink-0" />
          <span className="text-base font-medium mr-2">Analysis details</span>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(activeTab === tab.id ? null : tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab && (
          <div className="px-6 py-6 animate-fade-in-down">
            {activeTab === "translation" && (
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Translation</p>
                <p className="text-lg italic">&ldquo;{DEMO_PEDAGOGICAL.translation}&rdquo;</p>
              </div>
            )}

            {activeTab === "concepts" && (
              <div className="space-y-5">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Key concepts</p>
                {DEMO_PEDAGOGICAL.concepts.map((concept, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4.5 h-4.5 text-primary" />
                      <span className="text-lg font-medium">{concept.name}</span>
                    </div>
                    <p className="text-base text-muted-foreground leading-relaxed">{concept.description}</p>
                    {concept.related_words.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {concept.related_words.map((word, j) => (
                          <span key={j} className="text-sm px-2.5 py-1 rounded bg-surface-2 text-muted-foreground">
                            {word}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === "tips" && (
              <div className="space-y-5">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Why is it this way?</p>
                {DEMO_PEDAGOGICAL.tips.map((tip, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center gap-2 text-base">
                      <ChevronRight className="w-4.5 h-4.5 text-primary shrink-0" />
                      <span className="font-mono text-primary bg-primary/5 px-2 py-0.5 rounded">{tip.word}</span>
                      <span className="font-medium">{tip.question}</span>
                    </div>
                    <p className="text-base text-muted-foreground pl-7 leading-relaxed">{tip.explanation}</p>
                    {tip.rule && (
                      <p className="text-sm text-muted-foreground pl-7 italic">{tip.rule}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
