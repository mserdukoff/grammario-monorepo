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
  ChevronDown,
  ChevronUp,
  X,
  MessageSquarePlus,
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
import { getFeatureInfo, getFeatureExample, getUposInfo, humanizeFeature, getCategoryLabel, type GrammarFeatureInfo } from "@/lib/grammar-features"
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
import { FeedbackForm } from "@/components/feedback/feedback-form"
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
  const [showDrawer, setShowDrawer] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [featureDetail, setFeatureDetail] = useState<{
    raw: string
    info: GrammarFeatureInfo | null
    isUpos: boolean
    uposLabel?: string
    uposDescription?: string
  } | null>(null)

  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)

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

  const handleFeatureClick = useCallback((rawFeature: string) => {
    const info = getFeatureInfo(rawFeature)
    setFeatureDetail({ raw: rawFeature, info, isUpos: false })
  }, [])

  const handleUposClick = useCallback((upos: string) => {
    const uposInfo = getUposInfo(upos)
    setFeatureDetail({
      raw: upos,
      info: null,
      isUpos: true,
      uposLabel: uposInfo?.label || upos,
      uposDescription: uposInfo?.description,
    })
  }, [])

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
            hasError: !!err,
            errorMessage: err?.message,
            onFeatureClick: handleFeatureClick,
            onUposClick: handleUposClick,
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
          style: { stroke: "var(--primary)", strokeWidth: 1.5 },
        }))

      const layoutedNodes = applyLayout(layoutMode, rawNodes, rawEdges)
      setNodes(layoutedNodes)
      setEdges(rawEdges)
      setCurrentAnalysis(response)
      addRecentAnalysis(response)
      setShowDrawer(true)

      if (user) {
        try {
          const savedId = await saveAnalysis(user.id, response)
          setCurrentAnalysisId(savedId)
          setShowFeedbackForm(false)
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
              toast.success("Daily goal achieved! +50 XP")
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
    setCurrentAnalysisId(analysis.id)
    setShowFeedbackForm(false)
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
        onFeatureClick: handleFeatureClick,
        onUposClick: handleUposClick,
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
        style: { stroke: "var(--primary)", strokeWidth: 1.5 },
      }))

    const layoutedNodes = applyLayout(layoutMode, rawNodes, rawEdges)
    setNodes(layoutedNodes)
    setEdges(rawEdges)
    setShowDrawer(true)
    setShowSidebar(false)
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
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <AppNavbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </main>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const hasResults = pedagogicalData || difficultyInfo || grammarErrors.length > 0

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <AppNavbar />

      <AchievementToast
        type={achievementToast.type}
        title={achievementToast.title}
        description={achievementToast.description}
        xp={achievementToast.xp}
        isVisible={achievementToast.show}
        onClose={() => setAchievementToast((prev) => ({ ...prev, show: false }))}
      />

      <main className="flex-1 flex flex-col overflow-hidden h-[calc(100vh-3.5rem)]">
        {/* Top input bar */}
        <div className="border-b border-border bg-card px-4 py-3">
          <div className="flex items-center gap-3 max-w-screen-xl mx-auto">
            <Select value={selectedLang} onValueChange={setSelectedLang}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Language" />
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

            <div className="flex-1 relative">
              <input
                type="text"
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Enter a sentence to analyze..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              />
            </div>

            <button
              onClick={handleSpeak}
              className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              title="Listen"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            <Button onClick={handleAnalyze} disabled={loading} size="sm" className="h-9">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Analyze
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </>
              )}
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className={cn(
                "p-2 rounded-md transition-colors",
                showSidebar ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              title="Stats & History"
            >
              <History className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
          {/* Graph canvas */}
          <div className="flex-1 relative">
            {nodes.length > 0 && (
              <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-card/90 backdrop-blur-sm p-1 rounded-lg border border-border shadow-sm">
                <Toggle
                  aria-label="Toggle Draggable"
                  pressed={isDraggable}
                  onPressedChange={toggleDraggable}
                  className="h-7 w-7 p-0 data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                >
                  <Move className="h-3.5 w-3.5" />
                </Toggle>
                <div className="w-px h-4 bg-border" />
                <ToggleGroup
                  type="single"
                  value={layoutMode}
                  onValueChange={handleLayoutChange}
                >
                  <ToggleGroupItem
                    value="linear"
                    aria-label="Linear View"
                    className="h-7 px-2 text-xs"
                  >
                    <AlignCenter className="w-3.5 h-3.5 mr-1" />
                    Sentence
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="tree"
                    aria-label="Tree View"
                    className="h-7 px-2 text-xs"
                  >
                    <GitBranch className="w-3.5 h-3.5 mr-1" />
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
              className="bg-background"
              proOptions={{ hideAttribution: true }}
            >
              <Controls
                showInteractive={false}
                className="!bg-card !border-border !shadow-sm [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-accent"
              />
            </ReactFlow>

            {nodes.length === 0 && !loading && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center space-y-2 p-6">
                  <p className="text-muted-foreground">
                    Enter a sentence above and press Analyze to visualize its structure.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Beta access: Unlimited analyses
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Feature detail panel */}
          {featureDetail && (
            <div className="w-80 border-l border-border bg-card overflow-y-auto animate-fade-in-down">
              <div className="sticky top-0 bg-card border-b border-border px-4 py-3 flex items-center justify-between z-10">
                <h3 className="text-sm font-medium">Grammar Reference</h3>
                <button
                  onClick={() => setFeatureDetail(null)}
                  className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-5">
                {featureDetail.isUpos ? (
                  <>
                    <div>
                      <span className="inline-block px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium mb-3">
                        Part of Speech
                      </span>
                      <h4 className="font-heading text-xl italic mb-2">{featureDetail.uposLabel}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {featureDetail.uposDescription || "No description available for this part of speech."}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground border-t border-border pt-3">
                      <span className="font-mono bg-surface-2 px-1.5 py-0.5 rounded">{featureDetail.raw}</span>
                      <span className="ml-2">Universal Dependencies tag</span>
                    </div>
                  </>
                ) : featureDetail.info ? (
                  <>
                    <div>
                      <span className="inline-block px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium mb-3">
                        {getCategoryLabel(featureDetail.info.category)}
                      </span>
                      <h4 className="font-heading text-xl italic mb-2">{featureDetail.info.label}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {featureDetail.info.description}
                      </p>
                    </div>

                    {(() => {
                      const example = getFeatureExample(featureDetail.info, selectedLang)
                      return example ? (
                        <div className="rounded-lg bg-surface-2 p-3 space-y-1">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Example</p>
                          <p className="text-sm italic">{example}</p>
                        </div>
                      ) : null
                    })()}

                    {featureDetail.info.tip && (
                      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-1">
                        <p className="text-xs font-medium text-primary uppercase tracking-wider flex items-center gap-1">
                          <Lightbulb className="w-3 h-3" />
                          Tip
                        </p>
                        <p className="text-sm text-foreground leading-relaxed">{featureDetail.info.tip}</p>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground border-t border-border pt-3">
                      <span className="font-mono bg-surface-2 px-1.5 py-0.5 rounded">{featureDetail.raw}</span>
                      <span className="ml-2">Universal Dependencies tag</span>
                    </div>
                  </>
                ) : (
                  <div>
                    <span className="inline-block px-2 py-1 rounded bg-surface-2 text-muted-foreground text-xs font-medium mb-3">
                      Morphological Feature
                    </span>
                    <h4 className="font-heading text-xl italic mb-2">{humanizeFeature(featureDetail.raw)}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Detailed information for this feature is not yet available. The raw tag <span className="font-mono bg-surface-2 px-1 py-0.5 rounded">{featureDetail.raw}</span> comes from the Universal Dependencies annotation scheme.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Right sidebar (stats/history) */}
          {showSidebar && (
            <div className="w-72 border-l border-border bg-card overflow-y-auto p-4 space-y-4">
              <div className="flex gap-1 p-0.5 bg-surface-2 rounded-md">
                <button
                  onClick={() => setSidePanel("stats")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded-md transition-colors",
                    sidePanel === "stats"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Stats
                </button>
                <button
                  onClick={() => setSidePanel("history")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded-md transition-colors",
                    sidePanel === "history"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <History className="w-3.5 h-3.5" />
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
            </div>
          )}
        </div>

        {/* Bottom drawer for pedagogical content */}
        {hasResults && (
          <div className={cn(
            "border-t border-border bg-card transition-all duration-300",
            showDrawer ? "max-h-[45vh]" : "max-h-10"
          )} style={{ transitionTimingFunction: "var(--ease-out-quart)" }}>
            <div className="flex items-center">
              <button
                onClick={() => setShowDrawer(!showDrawer)}
                className="flex-1 flex items-center justify-between px-4 py-2.5 text-sm hover:bg-accent/50 transition-colors"
              >
                <span className="font-medium flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Analysis details
                  {difficultyInfo && (
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-xs font-mono",
                      difficultyInfo.level === "A1" || difficultyInfo.level === "A2" ? "bg-success-light text-success" :
                      difficultyInfo.level === "B1" || difficultyInfo.level === "B2" ? "bg-warning-light text-warning" :
                      "bg-error-light text-error"
                    )}>
                      {difficultyInfo.level}
                    </span>
                  )}
                  {grammarErrors.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-xs bg-error-light text-error">
                      {grammarErrors.length} issue{grammarErrors.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </span>
                {showDrawer ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
              {currentAnalysisId && user && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowFeedbackForm(!showFeedbackForm)
                    if (!showDrawer) setShowDrawer(true)
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 mr-3 rounded-md text-xs font-medium transition-colors border",
                    showFeedbackForm
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-surface-2 text-muted-foreground hover:text-foreground hover:border-primary/50"
                  )}
                  title="Give feedback on this analysis"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  Feedback
                </button>
              )}
            </div>

            {showDrawer && (
              <div className="overflow-y-auto max-h-[calc(45vh-2.5rem)] px-4 pb-4">
                {showFeedbackForm && currentAnalysisId && user && (
                  <div className="max-w-md mx-auto mb-4">
                    <FeedbackForm
                      userId={user.id}
                      analysisId={currentAnalysisId}
                      sentenceText={inputText}
                      language={selectedLang}
                      onClose={() => setShowFeedbackForm(false)}
                    />
                  </div>
                )}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-screen-xl mx-auto">
                  {/* Translation & difficulty */}
                  {pedagogicalData && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Translation</p>
                        <p className="text-sm italic">&ldquo;{pedagogicalData.translation}&rdquo;</p>
                      </div>
                      {pedagogicalData.nuance && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Nuance</p>
                          <p className="text-sm text-muted-foreground">{pedagogicalData.nuance}</p>
                        </div>
                      )}
                      {difficultyInfo && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Difficulty</p>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "px-2 py-1 rounded text-sm font-medium",
                              difficultyInfo.level === "A1" || difficultyInfo.level === "A2" ? "bg-success-light text-success" :
                              difficultyInfo.level === "B1" || difficultyInfo.level === "B2" ? "bg-warning-light text-warning" :
                              "bg-error-light text-error"
                            )}>
                              {difficultyInfo.level}
                            </span>
                            <div className="w-20 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${difficultyInfo.score * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Grammar concepts */}
                  {pedagogicalData && pedagogicalData.concepts.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Key concepts</p>
                      {pedagogicalData.concepts.map((concept, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Lightbulb className="w-3 h-3 text-primary" />
                            <span className="text-sm font-medium">{concept.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{concept.description}</p>
                          {concept.related_words.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {concept.related_words.map((word, j) => (
                                <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-muted-foreground">
                                  {word}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tips & errors column */}
                  <div className="space-y-4">
                    {grammarErrors.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-error uppercase tracking-wider flex items-center gap-1.5">
                          <HelpCircle className="w-3 h-3" />
                          Grammar issues
                        </p>
                        {grammarErrors.map((err, i) => (
                          <div key={i} className="rounded-md bg-error-light p-2.5 text-xs space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-error bg-background px-1.5 py-0.5 rounded">{err.word}</span>
                              <span className="text-muted-foreground uppercase text-[10px]">{err.error_type}</span>
                            </div>
                            <p className="text-foreground">{err.message}</p>
                            {err.rule && <p className="text-muted-foreground italic">{err.rule}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    {pedagogicalData?.tips && pedagogicalData.tips.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Why is it this way?</p>
                        {pedagogicalData.tips.map((tip, i) => (
                          <div key={i} className="space-y-1 text-xs">
                            <div className="flex items-center gap-1.5">
                              <ChevronRight className="w-3 h-3 text-primary shrink-0" />
                              <span className="font-mono text-primary bg-primary/5 px-1 rounded">{tip.word}</span>
                              <span className="font-medium">{tip.question}</span>
                            </div>
                            <p className="text-muted-foreground pl-5 leading-relaxed">{tip.explanation}</p>
                            {tip.rule && (
                              <p className="text-muted-foreground pl-5 italic">{tip.rule}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {pedagogicalData?.errors && pedagogicalData.errors.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-error uppercase tracking-wider">AI corrections</p>
                        {pedagogicalData.errors.map((err, i) => (
                          <div key={i} className="rounded-md bg-error-light p-2.5 text-xs space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-error line-through">{err.word}</span>
                              {err.correction && (
                                <>
                                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                  <span className="font-mono text-success">{err.correction}</span>
                                </>
                              )}
                            </div>
                            <p className="text-foreground">{err.explanation}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
