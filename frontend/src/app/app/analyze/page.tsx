"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import dagre from "dagre"
import {
  Sparkles,
  ArrowRight,
  Loader2,
  BookOpen,
  Lightbulb,
  GitBranch,
  AlignCenter,
  Move,
  Volume2,
  History,
  BarChart3,
  HelpCircle,
  ChevronRight,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { AppNavbar } from "@/components/ui/app-navbar"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Toggle } from "@/components/ui/toggle"
import { WordNode } from "@/components/flow/WordNode"
import { StatsPanel } from "@/components/gamification/stats-panel"
import { HistoryPanel } from "@/components/gamification/history-panel"
import { AchievementToast } from "@/components/gamification/achievement-toast"

import { useAuth } from "@/lib/auth-context"
import { useAppStore } from "@/store/useAppStore"
import { analyzeText, type AnalysisResponse, type DifficultyInfo, type RuleBasedError } from "@/lib/api"
import {
  saveAnalysis,
  getRecentAnalyses,
  toggleFavoriteAnalysis,
  deleteAnalysis,
  addXP,
  incrementTotalAnalyses,
  incrementDailyGoalProgress,
  getDailyGoal,
  setDailyGoal,
  XP_REWARDS,
} from "@/lib/db"
import type { Analysis, DailyGoal } from "@/lib/supabase/database.types"
import { cn } from "@/lib/utils"

const nodeTypes = {
  word: WordNode,
}

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction: "TB" | "LR" = "TB"
) => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))

  const isHorizontal = direction === "LR"

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 50,
    ranksep: 80,
  })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 140, height: 100 })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - 70,
        y: nodeWithPosition.y - 50,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}

export default function AnalyzePage() {
  const router = useRouter()
  const { user, profile, loading: authLoading, refreshProfile } = useAuth()
  const { preferences, setCurrentAnalysis, addRecentAnalysis } = useAppStore()

  const [inputText, setInputText] = useState("Il gatto mangia il pesce.")
  const [selectedLang, setSelectedLang] = useState(preferences.defaultLanguage)
  const [loading, setLoading] = useState(false)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [pedagogicalData, setPedagogicalData] = useState<AnalysisResponse["pedagogical_data"] | null>(null)
  const [difficultyInfo, setDifficultyInfo] = useState<DifficultyInfo | null>(null)
  const [grammarErrors, setGrammarErrors] = useState<RuleBasedError[]>([])
  const [layoutMode, setLayoutMode] = useState<"linear" | "tree">("linear")
  const [isDraggable, setIsDraggable] = useState(false)

  const [dailyGoal, setDailyGoalState] = useState<DailyGoal | null>(null)
  const [history, setHistory] = useState<Analysis[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [sidePanel, setSidePanel] = useState<"stats" | "history">("stats")
  const [achievementToast, setAchievementToast] = useState<{
    show: boolean
    type: "achievement" | "level_up" | "streak" | "xp"
    title: string
    description: string
    xp?: number
  }>({ show: false, type: "xp", title: "", description: "" })

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/app")
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (user) {
      loadUserData()
    } else {
      setHistoryLoading(false)
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return
    setHistoryLoading(true)
    try {
      const [analyses, goal] = await Promise.all([
        getRecentAnalyses(user.id, 20),
        getDailyGoal(user.id),
      ])
      setHistory(analyses)
      if (goal) {
        setDailyGoalState(goal)
      } else {
        const newGoal = await setDailyGoal(user.id, preferences.dailyGoalTarget)
        setDailyGoalState(newGoal)
      }
    } catch (error) {
      console.error("Failed to load user data:", error)
    } finally {
      setHistoryLoading(false)
    }
  }

  const showXPToast = (amount: number, reason: string) => {
    setAchievementToast({
      show: true,
      type: "xp",
      title: `+${amount} XP`,
      description: reason,
      xp: amount,
    })
    setTimeout(() => setAchievementToast((prev) => ({ ...prev, show: false })), 3000)
  }

  const applyLayout = useCallback(
    (mode: "linear" | "tree", currentNodes: Node[], currentEdges: Edge[]) => {
      if (mode === "linear") {
        const sortedNodes = [...currentNodes].sort(
          (a, b) => parseInt(a.id) - parseInt(b.id)
        )
        return sortedNodes.map((node, index) => ({
          ...node,
          targetPosition: Position.Top,
          sourcePosition: Position.Bottom,
          position: { x: index * 220, y: 100 },
          draggable: isDraggable,
        }))
      } else {
        const { nodes: layoutedNodes } = getLayoutedElements(
          currentNodes,
          currentEdges,
          "TB"
        )
        return layoutedNodes.map((node) => ({
          ...node,
          draggable: isDraggable,
        }))
      }
    },
    [isDraggable]
  )

  const handleLayoutChange = (val: string) => {
    if (!val) return
    const newMode = val as "linear" | "tree"
    setLayoutMode(newMode)
    const newNodes = applyLayout(newMode, nodes, edges)
    setNodes(newNodes)
  }

  const toggleDraggable = (pressed: boolean) => {
    setIsDraggable(pressed)
    setNodes((nds) => nds.map((n) => ({ ...n, draggable: pressed })))
  }

  const handleAnalyze = async () => {
    if (!inputText.trim()) return
    setLoading(true)
    setPedagogicalData(null)
    setDifficultyInfo(null)
    setGrammarErrors([])

    try {
      const response = await analyzeText(inputText, selectedLang)

      if (response.pedagogical_data) {
        setPedagogicalData(response.pedagogical_data)
      }
      if (response.difficulty) {
        setDifficultyInfo(response.difficulty)
      }
      if (response.grammar_errors) {
        setGrammarErrors(response.grammar_errors)
      }

      const errorByWordId = new Map<number, RuleBasedError>()
      for (const err of response.grammar_errors || []) {
        errorByWordId.set(err.word_id, err)
      }

      const rawNodes: Node[] = response.nodes.map((token) => {
        const err = errorByWordId.get(token.id)
        return {
          id: token.id.toString(),
          type: "word",
          position: { x: 0, y: 0 },
          draggable: isDraggable,
          data: {
            text: token.text,
            lemma: token.lemma,
            upos: token.upos,
            feats: token.feats,
            segments: token.segments,
            frequency_band: token.frequency_band,
            hasError: !!err,
            errorMessage: err?.message,
          },
        }
      })

      const rawEdges: Edge[] = response.nodes
        .filter((token) => token.head_id !== 0)
        .map((token) => ({
          id: `e${token.head_id}-${token.id}`,
          source: token.head_id.toString(),
          target: token.id.toString(),
          label: token.deprel,
          type: "default",
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: "hsl(var(--primary))", strokeWidth: 2 },
        }))

      const layoutedNodes = applyLayout(layoutMode, rawNodes, rawEdges)
      setNodes(layoutedNodes)
      setEdges(rawEdges)
      setCurrentAnalysis(response)
      addRecentAnalysis(response)

      if (user) {
        try {
          await saveAnalysis(user.id, response)
          await incrementTotalAnalyses(user.id)

          const xpResult = await addXP(user.id, XP_REWARDS.ANALYSIS)
          showXPToast(XP_REWARDS.ANALYSIS, "Sentence analyzed!")

          if (xpResult.leveledUp) {
            setTimeout(() => {
              setAchievementToast({
                show: true,
                type: "level_up",
                title: `Level ${xpResult.newLevel}!`,
                description: "You leveled up! Keep learning!",
                xp: 0,
              })
            }, 3500)
          }

          const updatedGoal = await incrementDailyGoalProgress(user.id)
          if (updatedGoal) {
            setDailyGoalState(updatedGoal)
            if (
              updatedGoal.is_achieved &&
              updatedGoal.completed === updatedGoal.target
            ) {
              await addXP(user.id, XP_REWARDS.COMPLETE_DAILY_GOAL)
              toast.success("🎯 Daily goal achieved! +50 XP")
            }
          }

          await refreshProfile()
          const analyses = await getRecentAnalyses(user.id, 20)
          setHistory(analyses)
        } catch (err) {
          console.error("Failed to save analysis:", err)
        }
      }

      toast.success("Analysis complete!")
    } catch (error) {
      console.error("Analysis failed:", error)
      toast.error("Failed to analyze sentence. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSpeak = () => {
    if (!inputText || !("speechSynthesis" in window)) return
    const utterance = new SpeechSynthesisUtterance(inputText)
    utterance.lang = {
      it: "it-IT",
      es: "es-ES",
      de: "de-DE",
      ru: "ru-RU",
      tr: "tr-TR",
    }[selectedLang] || "en-US"
    speechSynthesis.speak(utterance)
  }

  const handleSelectFromHistory = (analysis: Analysis) => {
    setInputText(analysis.text)
    setSelectedLang(analysis.language)
    const nodeData = analysis.nodes as unknown as AnalysisResponse["nodes"]
    const pedData = analysis.pedagogical_data as unknown as AnalysisResponse["pedagogical_data"]

    setPedagogicalData(pedData || null)
    setDifficultyInfo(null)
    setGrammarErrors([])

    const rawNodes: Node[] = nodeData.map((token) => ({
      id: token.id.toString(),
      type: "word",
      position: { x: 0, y: 0 },
      draggable: isDraggable,
      data: {
        text: token.text,
        lemma: token.lemma,
        upos: token.upos,
        feats: token.feats,
        segments: token.segments,
        frequency_band: token.frequency_band,
      },
    }))

    const rawEdges: Edge[] = nodeData
      .filter((token) => token.head_id !== 0)
      .map((token) => ({
        id: `e${token.head_id}-${token.id}`,
        source: token.head_id.toString(),
        target: token.id.toString(),
        label: token.deprel,
        type: "default",
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: "hsl(var(--primary))", strokeWidth: 2 },
      }))

    const layoutedNodes = applyLayout(layoutMode, rawNodes, rawEdges)
    setNodes(layoutedNodes)
    setEdges(rawEdges)
  }

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      await toggleFavoriteAnalysis(id, isFavorite)
      setHistory((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_favorite: isFavorite } : a))
      )
      toast.success(isFavorite ? "Added to favorites" : "Removed from favorites")
    } catch (error) {
      toast.error("Failed to update favorite")
    }
  }

  const handleDeleteAnalysis = async (id: string) => {
    try {
      await deleteAnalysis(id)
      setHistory((prev) => prev.filter((a) => a.id !== id))
      toast.success("Analysis deleted")
    } catch (error) {
      toast.error("Failed to delete analysis")
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-950 text-foreground">
        <AppNavbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </main>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none opacity-20" />
      <AppNavbar />

      <AchievementToast
        type={achievementToast.type}
        title={achievementToast.title}
        description={achievementToast.description}
        xp={achievementToast.xp}
        isVisible={achievementToast.show}
        onClose={() => setAchievementToast((prev) => ({ ...prev, show: false }))}
      />

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden h-[calc(100vh-3.5rem)] relative z-10">
        <div className="w-full md:w-1/3 lg:w-1/4 border-r border-border p-6 flex flex-col gap-6 overflow-y-auto bg-slate-900/50 backdrop-blur-sm z-20 shadow-xl">
          <div className="flex gap-2 p-1 bg-slate-800/50 rounded-lg">
            <button
              onClick={() => setSidePanel("stats")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-md transition-colors",
                sidePanel === "stats"
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-white"
              )}
            >
              <BarChart3 className="w-4 h-4" />
              Stats
            </button>
            <button
              onClick={() => setSidePanel("history")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-md transition-colors",
                sidePanel === "history"
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-white"
              )}
            >
              <History className="w-4 h-4" />
              History
            </button>
          </div>

          {sidePanel === "stats" && (
            <StatsPanel dailyGoal={dailyGoal} />
          )}
          {sidePanel === "history" && (
            <HistoryPanel
              analyses={history}
              onSelect={handleSelectFromHistory}
              onToggleFavorite={handleToggleFavorite}
              onDelete={handleDeleteAnalysis}
              loading={historyLoading}
            />
          )}

          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Analyze
            </h2>

            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Select value={selectedLang} onValueChange={setSelectedLang}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="it">🇮🇹 Italian</SelectItem>
                    <SelectItem value="es">🇪🇸 Spanish</SelectItem>
                    <SelectItem value="de">🇩🇪 German</SelectItem>
                    <SelectItem value="ru">🇷🇺 Russian</SelectItem>
                    <SelectItem value="tr">🇹🇷 Turkish</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Sentence</label>
                <button
                  onClick={handleSpeak}
                  className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Listen"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <textarea
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter text to analyze..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Beta access: Unlimited analyses 🎉
              </p>
            </div>

            <Button onClick={handleAnalyze} disabled={loading} className="w-full">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              Analyze
            </Button>
          </div>

          {difficultyInfo && (
            <div className="border-t border-border pt-4 animate-accordion-down">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-400">Difficulty Level</span>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-2.5 py-1 rounded-md text-sm font-bold border",
                    difficultyInfo.level === "A1" && "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
                    difficultyInfo.level === "A2" && "bg-green-500/20 border-green-500/30 text-green-300",
                    difficultyInfo.level === "B1" && "bg-yellow-500/20 border-yellow-500/30 text-yellow-300",
                    difficultyInfo.level === "B2" && "bg-orange-500/20 border-orange-500/30 text-orange-300",
                    difficultyInfo.level === "C1" && "bg-red-500/20 border-red-500/30 text-red-300",
                    difficultyInfo.level === "C2" && "bg-purple-500/20 border-purple-500/30 text-purple-300",
                  )}>
                    {difficultyInfo.level}
                  </span>
                  <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500 rounded-full transition-all"
                      style={{ width: `${difficultyInfo.score * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {grammarErrors.length > 0 && (
            <div className="space-y-3 border-t border-border pt-4 animate-accordion-down">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-red-400">
                <HelpCircle className="w-4 h-4" />
                Grammar Issues Detected
              </h3>
              {grammarErrors.map((err, i) => (
                <div key={i} className="rounded-lg border border-red-500/20 bg-red-950/10 p-2.5 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-red-300 bg-red-900/30 px-1.5 py-0.5 rounded">
                      {err.word}
                    </span>
                    <span className="text-red-400/70 uppercase text-[10px]">{err.error_type}</span>
                  </div>
                  <p className="text-slate-300">{err.message}</p>
                  {err.rule && <p className="text-slate-500 italic mt-1">{err.rule}</p>}
                </div>
              ))}
            </div>
          )}

          {pedagogicalData && (
            <div className="space-y-4 border-t border-border pt-6 animate-accordion-down">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-500" />
                Teacher&apos;s Notes
              </h3>

              <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3">
                <div>
                  <p className="text-xs text-emerald-400 font-semibold mb-1">
                    TRANSLATION
                  </p>
                  <p className="text-sm italic text-slate-200">
                    &quot;{pedagogicalData.translation}&quot;
                  </p>
                </div>

                {pedagogicalData.nuance && (
                  <div>
                    <p className="text-xs text-emerald-400 font-semibold mb-1">
                      NUANCE
                    </p>
                    <p className="text-xs text-slate-300">
                      {pedagogicalData.nuance}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {pedagogicalData.concepts.map((concept, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border bg-background/50 p-3 text-sm"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb className="w-3 h-3 text-yellow-400" />
                      <span className="font-semibold text-indigo-300">
                        {concept.name}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs mb-2 leading-relaxed">
                      {concept.description}
                    </p>
                    {concept.related_words.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {concept.related_words.map((word, j) => (
                          <span
                            key={j}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700"
                          >
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

          {pedagogicalData?.tips && pedagogicalData.tips.length > 0 && (
            <div className="space-y-4 border-t border-border pt-6 animate-accordion-down">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                Why is it this way?
              </h3>
              <div className="space-y-3">
                {pedagogicalData.tips.map((tip, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 text-sm"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <ChevronRight className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-mono text-amber-300 bg-amber-900/30 px-1.5 py-0.5 rounded text-xs">
                          {tip.word}
                        </span>
                        <p className="text-slate-200 text-xs mt-1 font-medium">
                          {tip.question}
                        </p>
                      </div>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed pl-6">
                      {tip.explanation}
                    </p>
                    {tip.rule && (
                      <div className="mt-2 pl-6">
                        <p className="text-[10px] text-amber-400/80 font-semibold uppercase tracking-wide">
                          Rule
                        </p>
                        <p className="text-slate-400 text-xs italic">
                          {tip.rule}
                        </p>
                      </div>
                    )}
                    {tip.examples && tip.examples.length > 0 && (
                      <div className="mt-2 pl-6">
                        <p className="text-[10px] text-amber-400/80 font-semibold uppercase tracking-wide mb-1">
                          More Examples
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {tip.examples.map((ex, j) => (
                            <span
                              key={j}
                              className="text-[10px] px-2 py-1 rounded bg-slate-800/50 text-slate-300 border border-slate-700"
                            >
                              {ex}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {pedagogicalData?.errors && pedagogicalData.errors.length > 0 && (
            <div className="space-y-3 border-t border-border pt-6 animate-accordion-down">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-red-400">
                <Sparkles className="w-4 h-4" />
                AI-Detected Corrections
              </h3>
              {pedagogicalData.errors.map((err, i) => (
                <div key={i} className="rounded-lg border border-red-500/20 bg-red-950/10 p-3 text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-red-300 bg-red-900/30 px-1.5 py-0.5 rounded text-xs line-through">
                      {err.word}
                    </span>
                    {err.correction && (
                      <>
                        <ChevronRight className="w-3 h-3 text-slate-500" />
                        <span className="font-mono text-emerald-300 bg-emerald-900/30 px-1.5 py-0.5 rounded text-xs">
                          {err.correction}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-slate-300 text-xs">{err.explanation}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 bg-slate-950 relative flex flex-col">
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
              <ToggleGroup
                type="single"
                value={layoutMode}
                onValueChange={handleLayoutChange}
              >
                <ToggleGroupItem
                  value="linear"
                  aria-label="Linear View"
                  className="h-8 px-2 text-xs"
                >
                  <AlignCenter className="w-4 h-4 mr-1" />
                  Sentence
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="tree"
                  aria-label="Tree View"
                  className="h-8 px-2 text-xs"
                >
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
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.5}
            maxZoom={2}
            className="bg-slate-950"
            proOptions={{ hideAttribution: true }}
          >
            <Controls
              showInteractive={false}
              className="bg-background border-border fill-foreground text-foreground"
            />
          </ReactFlow>

          {nodes.length === 0 && !loading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center space-y-2 p-6 rounded-xl bg-background/80 backdrop-blur border border-border">
                <p className="text-muted-foreground">
                  Enter a sentence and click Analyze to visualize.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
