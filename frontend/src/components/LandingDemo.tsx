"use client"

import React, { useEffect, useState, useCallback } from "react"
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from "reactflow"
import "reactflow/dist/style.css"
import { BookOpen, Lightbulb, Sparkles, Globe, Layers } from "lucide-react"
import { WordNode } from "@/components/flow/WordNode"
import { cn } from "@/lib/utils"

const nodeTypes = {
  word: WordNode,
}

// Hardcoded Data from backend generation + IT manually
const STATIC_DATA_ALL = {
  it: {
    metadata: {
      text: "Il gatto mangia il pesce.",
      language: "it"
    },
    nodes: [
      { id: "1", text: "Il", lemma: "il", upos: "DET", feats: "Definite=Def|Gender=Masc|Number=Sing|PronType=Art", head_id: 2, deprel: "det" },
      { id: "2", text: "gatto", lemma: "gatto", upos: "NOUN", feats: "Gender=Masc|Number=Sing", head_id: 3, deprel: "nsubj" },
      { id: "3", text: "mangia", lemma: "mangiare", upos: "VERB", feats: "Mood=Ind|Number=Sing|Person=3|Tense=Pres|VerbForm=Fin", head_id: 0, deprel: "root" },
      { id: "4", text: "il", lemma: "il", upos: "DET", feats: "Definite=Def|Gender=Masc|Number=Sing|PronType=Art", head_id: 5, deprel: "det" },
      { id: "5", text: "pesce", lemma: "pesce", upos: "NOUN", feats: "Gender=Masc|Number=Sing", head_id: 3, deprel: "obj" }
    ],
    pedagogical_data: {
      translation: "The cat eats the fish.",
      nuance: "A standard declarative sentence showing subject-verb-object order.",
      concepts: [
        { name: "Definite Articles", description: "Italian has different articles based on gender and starting letter. 'Il' is for masculine singular nouns starting with a consonant.", related_words: ["Il", "gatto", "pesce"] },
        { name: "Subject-Verb Agreement", description: "The verb 'mangia' (eats) agrees with the third-person singular subject 'Il gatto'.", related_words: ["mangia"] }
      ]
    }
  },
  es: {
    metadata: { text: "El gato come el pescado.", language: "es" },
    nodes: [
      { id: "1", text: "El", lemma: "el", upos: "DET", feats: "Definite=Def|Gender=Masc|Number=Sing|PronType=Art", head_id: 2, deprel: "det" },
      { id: "2", text: "gato", lemma: "gato", upos: "NOUN", feats: "Gender=Masc|Number=Sing", head_id: 3, deprel: "nsubj" },
      { id: "3", text: "come", lemma: "comir", upos: "VERB", feats: "Mood=Ind|Number=Sing|Person=3|Tense=Pres|VerbForm=Fin", head_id: 0, deprel: "root" },
      { id: "4", text: "el", lemma: "el", upos: "DET", feats: "Definite=Def|Gender=Masc|Number=Sing|PronType=Art", head_id: 5, deprel: "det" },
      { id: "5", text: "pescado", lemma: "pescado", upos: "NOUN", feats: "Gender=Masc|Number=Sing", head_id: 3, deprel: "obj" }
    ],
    pedagogical_data: {
      translation: "The cat eats the fish.",
      nuance: "Standard subject-verb-object structure in Spanish.",
      concepts: [
        { name: "Gender Agreement", description: "Articles and nouns must agree in gender (masculine 'El' with 'gato').", related_words: ["El", "gato"] },
        { name: "Verb Conjugation", description: "'Come' is the third-person singular of 'comer'.", related_words: ["come"] }
      ]
    }
  },
  de: {
    metadata: { text: "Die Katze frisst den Fisch.", language: "de" },
    nodes: [
      { id: "1", text: "Die", lemma: "der", upos: "DET", feats: "Case=Nom|Definite=Def|Gender=Fem|Number=Sing|PronType=Art", head_id: 2, deprel: "det" },
      { id: "2", text: "Katze", lemma: "Katze", upos: "NOUN", feats: "Case=Nom|Gender=Fem|Number=Sing", head_id: 3, deprel: "nsubj" },
      { id: "3", text: "frisst", lemma: "fressen", upos: "VERB", feats: "Mood=Ind|Number=Sing|Person=3|Tense=Pres|VerbForm=Fin", head_id: 0, deprel: "root" },
      { id: "4", text: "den", lemma: "der", upos: "DET", feats: "Case=Acc|Definite=Def|Gender=Masc|Number=Sing|PronType=Art", head_id: 5, deprel: "det" },
      { id: "5", text: "Fisch", lemma: "Fisch", upos: "NOUN", feats: "Case=Acc|Gender=Masc|Number=Sing", head_id: 3, deprel: "obj" }
    ],
    pedagogical_data: {
      translation: "The cat eats the fish.",
      nuance: "German distinguishes between humans eating (essen) and animals eating (fressen).",
      concepts: [
        { name: "Accusative Case", description: "The direct object 'den Fisch' is in the accusative case (changing from 'der' to 'den').", related_words: ["den", "Fisch"] },
        { name: "Noun Capitalization", description: "All nouns in German are capitalized.", related_words: ["Katze", "Fisch"] }
      ]
    }
  },
  ru: {
    metadata: { text: "Кошка ест рыбу.", language: "ru" },
    nodes: [
      { id: "1", text: "Кошка", lemma: "кошка", upos: "NOUN", feats: "Animacy=Anim|Case=Nom|Gender=Fem|Number=Sing", head_id: 2, deprel: "nsubj" },
      { id: "2", text: "ест", lemma: "есть", upos: "VERB", feats: "Aspect=Imp|Mood=Ind|Number=Sing|Person=3|Tense=Pres|VerbForm=Fin|Voice=Act", head_id: 0, deprel: "root" },
      { id: "3", text: "рыбу", lemma: "рыба", upos: "NOUN", feats: "Animacy=Anim|Case=Acc|Gender=Fem|Number=Sing", head_id: 2, deprel: "obj" }
    ],
    pedagogical_data: {
      translation: "The cat eats the fish.",
      nuance: "Russian has no articles (a/the). Case endings determine function.",
      concepts: [
        { name: "Accusative Case", description: "'рыбу' (rybu) is the accusative form of 'рыба' (ryba), marking it as the direct object.", related_words: ["рыбу"] },
        { name: "Gender", description: "'Кошка' is specifically a female cat.", related_words: ["Кошка"] }
      ]
    }
  },
  tr: {
    metadata: { text: "Kedi balığı yiyor.", language: "tr" },
    nodes: [
      { id: "1", text: "Kedi", lemma: "kedi", upos: "NOUN", feats: "Case=Nom|Number=Sing|Person=3", head_id: 3, deprel: "nsubj", segments: ["Case=Nom", "Number=Sing", "Person=3"] },
      { id: "2", text: "balığı", lemma: "balığı", upos: "ADJ", feats: "Case=Nom|Number=Sing|Person=3", head_id: 3, deprel: "obj", segments: ["Case=Acc", "Number=Sing"] },
      { id: "3", text: "yiyor", lemma: "ye", upos: "VERB", feats: "Aspect=Prog|Mood=Ind|Number=Sing|Person=3|Polarity=Pos|Polite=Infm|Tense=Pres", head_id: 0, deprel: "root", segments: ["Aspect=Prog", "Tense=Pres"] }
    ],
    pedagogical_data: {
      translation: "The cat is eating the fish.",
      nuance: "Turkish is SOV (Subject-Object-Verb).",
      concepts: [
        { name: "Accusative Suffix", description: "'balığı' comes from 'balık' (fish) + 'ı' (accusative suffix), with consonant softening k->ğ.", related_words: ["balığı"] },
        { name: "Continuous Aspect", description: "The suffix '-uyor' (yiyor) indicates an action currently in progress.", related_words: ["yiyor"] }
      ]
    }
  }
} as const

type SupportedLang = keyof typeof STATIC_DATA_ALL

const getLinearElements = (nodes: any[]) => {
  const nodeWidth = 220 // Increased slightly for breathing room
  const totalWidth = (nodes.length - 1) * nodeWidth
  // We want the sentence to be centered, so we start at negative half width
  const startX = -totalWidth / 2

  // Simple linear layout
  return nodes.map((node, index) => ({
    ...node,
    targetPosition: Position.Top,
    sourcePosition: Position.Bottom,
    // Ensure y is fixed, x is centered
    position: { x: startX + (index * nodeWidth), y: 0 }, 
    draggable: false, 
    connectable: false,
    selectable: false
  }))
}

export function LandingDemo() {
  const [activeLang, setActiveLang] = useState<SupportedLang>("it")
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const currentData = STATIC_DATA_ALL[activeLang]

  useEffect(() => {
    // Transform static data to ReactFlow elements
    const rawNodes: Node[] = currentData.nodes.map((token) => ({
      id: token.id,
      type: "word",
      // Initial position 0,0 - will be overwritten by layout
      position: { x: 0, y: 0 }, 
      data: {
        text: token.text,
        lemma: token.lemma,
        upos: token.upos,
        feats: token.feats,
        segments: (token as any).segments // Cast for TS if segments missing in type
      },
    }))

    const rawEdges: Edge[] = currentData.nodes
      .filter((token) => token.head_id !== 0) // Root has head 0
      .map((token) => ({
        id: `e${token.head_id}-${token.id}`,
        source: token.head_id.toString(),
        target: token.id.toString(),
        label: token.deprel,
        type: "smoothstep", // Cleaner for linear
        animated: false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        style: { stroke: "hsl(var(--primary))", strokeWidth: 1.5, opacity: 0.5 },
      }))

    const layoutedNodes = getLinearElements(rawNodes)
    setNodes(layoutedNodes)
    setEdges(rawEdges)
  }, [activeLang, setNodes, setEdges, currentData])

  return (
    <div className="w-full max-w-6xl mx-auto border border-border rounded-xl overflow-hidden shadow-2xl bg-slate-950/50 backdrop-blur-sm flex flex-col h-[800px] animate-in fade-in zoom-in-95 duration-500">
        
        {/* Language Tabs / Visualization Panel (Top) */}
        <div className="relative border-b border-border bg-slate-950/30 flex flex-col h-[500px]">
            {/* Language Selector */}
            <div className="flex border-b border-border bg-slate-900/50 backdrop-blur-md">
                {(Object.keys(STATIC_DATA_ALL) as SupportedLang[]).map((lang) => (
                    <button
                        key={lang}
                        onClick={() => setActiveLang(lang)}
                        className={cn(
                            "flex-1 px-4 py-3 text-sm font-medium transition-colors relative",
                            activeLang === lang 
                                ? "text-indigo-400 bg-indigo-950/20" 
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                        )}
                    >
                        {lang.toUpperCase()}
                        {activeLang === lang && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
                        )}
                    </button>
                ))}
            </div>

            <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
          fitViewOptions={{ padding: 0.2, includeHiddenNodes: true, minZoom: activeLang === 'ru' || activeLang === 'tr' ? 1.0 : 0.5 }}
          translateExtent={undefined}
            minZoom={0.5}
            maxZoom={2}
            panOnDrag={false} // Disable panning
            zoomOnScroll={false} // Disable zooming
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            nodesDraggable={false} // Disable node dragging
            nodesConnectable={false}
            elementsSelectable={false} // Prevent selection box
            proOptions={{ hideAttribution: true }}
            className="bg-transparent pointer-events-none" // Disable all interaction
          />
            </div>
            
            <div className="absolute bottom-4 left-4 right-4 text-center">
                 <p className="text-xl font-medium text-slate-200">"{currentData.metadata.text}"</p>
            </div>
        </div>

        {/* Insights Panel (Bottom) */}
        <div className="w-full p-6 flex flex-col gap-6 bg-slate-900/30 overflow-y-auto border-t border-border flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                        <BookOpen className="w-5 h-5 text-emerald-500" />
                        Teacher's Notes
                    </h3>
                    
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3">
                        <div>
                            <p className="text-xs text-emerald-400 font-semibold mb-1">TRANSLATION</p>
                            <p className="text-sm italic text-slate-200">"{currentData.pedagogical_data.translation}"</p>
                        </div>
                        <div>
                            <p className="text-xs text-emerald-400 font-semibold mb-1">NUANCE</p>
                            <p className="text-xs text-slate-300">{currentData.pedagogical_data.nuance}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                     <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                        Key Concepts
                    </h3>
                    <div className="grid gap-3">
                        {currentData.pedagogical_data.concepts.map((concept, i) => (
                            <div key={i} className="rounded-lg border border-border bg-background/30 p-3 text-sm">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-indigo-300">{concept.name}</span>
                                </div>
                                <p className="text-slate-300 text-xs mb-2 leading-relaxed">{concept.description}</p>
                                <div className="flex flex-wrap gap-1">
                                    {concept.related_words.map((word, j) => (
                                        <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                            {word}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
