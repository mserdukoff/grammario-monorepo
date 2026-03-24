"use client"

import { useEffect, useState, useCallback } from "react"
import {
  MessageSquare, Star, Filter, RefreshCw, CheckCircle2,
  Circle, ChevronDown, ChevronUp, Globe, Clock, User,
  AlertCircle, StickyNote,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { authFetch } from "@/lib/auth-fetch"

const LANG_FLAGS: Record<string, string> = {
  it: "\u{1F1EE}\u{1F1F9}", es: "\u{1F1EA}\u{1F1F8}", de: "\u{1F1E9}\u{1F1EA}",
  ru: "\u{1F1F7}\u{1F1FA}", tr: "\u{1F1F9}\u{1F1F7}",
}

const CATEGORY_LABELS: Record<string, string> = {
  accuracy: "Accuracy",
  translation: "Translation",
  grammar_tips: "Grammar Tips",
  difficulty: "Difficulty",
  other: "Other",
}

const CATEGORY_COLORS: Record<string, string> = {
  accuracy: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  translation: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  grammar_tips: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  difficulty: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  other: "bg-gray-500/10 text-gray-400 border-gray-500/20",
}

interface FeedbackItem {
  id: string
  user_id: string
  analysis_id: string
  rating: number
  category: string
  comment: string | null
  sentence_text: string
  language: string
  is_resolved: boolean
  admin_notes: string | null
  created_at: string
  updated_at: string
  users: { email: string; display_name: string | null } | null
}

interface FeedbackSummary {
  total: number
  unresolved: number
  avg_rating: number
}

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [summary, setSummary] = useState<FeedbackSummary | null>(null)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [filterCategory, setFilterCategory] = useState("all")
  const [filterResolved, setFilterResolved] = useState<string>("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filterCategory !== "all") params.set("category", filterCategory)
      if (filterResolved) params.set("resolved", filterResolved)

      const res = await authFetch(`/api/v1/admin/feedback?${params}`)
      if (res.ok) {
        const data = await res.json()
        setFeedback(data.feedback)
        setSummary(data.summary)
        setTotal(data.total)
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [filterCategory, filterResolved])

  useEffect(() => {
    setLoading(true)
    load()
  }, [load])

  const refresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const toggleResolved = async (item: FeedbackItem) => {
    try {
      await authFetch("/api/v1/admin/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, is_resolved: !item.is_resolved }),
      })
      setFeedback((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, is_resolved: !f.is_resolved } : f))
      )
    } catch {
      /* ignore */
    }
  }

  const saveNotes = async (item: FeedbackItem) => {
    const notes = adminNotes[item.id] ?? item.admin_notes ?? ""
    try {
      await authFetch("/api/v1/admin/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, admin_notes: notes }),
      })
      setFeedback((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, admin_notes: notes } : f))
      )
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            Sentence Feedback
          </h1>
          <p className="text-sm text-muted-foreground">
            Review user feedback on sentence analyses
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card hover:bg-accent border border-border text-xs transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-surface-2 p-4 flex items-start gap-3">
            <div className="p-2 rounded-lg border bg-primary/10 border-primary/20">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-0.5">Total Feedback</p>
              <p className="text-xl font-bold tabular-nums">{summary.total}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-2 p-4 flex items-start gap-3">
            <div className="p-2 rounded-lg border bg-warning-light border-warning/20">
              <AlertCircle className="w-4 h-4 text-warning" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-0.5">Unresolved</p>
              <p className="text-xl font-bold tabular-nums">{summary.unresolved}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-2 p-4 flex items-start gap-3">
            <div className="p-2 rounded-lg border bg-warning-light border-warning/20">
              <Star className="w-4 h-4 text-warning" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-0.5">Avg Rating</p>
              <p className="text-xl font-bold tabular-nums">{summary.avg_rating}/5</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="all">All categories</option>
          {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>

        <select
          value={filterResolved}
          onChange={(e) => setFilterResolved(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">All status</option>
          <option value="false">Unresolved</option>
          <option value="true">Resolved</option>
        </select>

        <span className="text-xs text-muted-foreground ml-auto">
          {total} result{total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Feedback list */}
      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Loading feedback...</div>
      ) : feedback.length === 0 ? (
        <div className="text-center py-20">
          <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-muted-foreground">No feedback found</p>
          <p className="text-xs text-muted-foreground mt-1">Adjust your filters or wait for user submissions</p>
        </div>
      ) : (
        <div className="space-y-2">
          {feedback.map((item) => {
            const isExpanded = expandedId === item.id
            return (
              <div
                key={item.id}
                className={cn(
                  "rounded-xl border bg-surface-2 transition-colors",
                  item.is_resolved ? "border-border opacity-70" : "border-border"
                )}
              >
                {/* Row header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent/30 transition-colors"
                >
                  {/* Resolved toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleResolved(item)
                    }}
                    className="shrink-0"
                    title={item.is_resolved ? "Mark as unresolved" : "Mark as resolved"}
                  >
                    {item.is_resolved ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                    )}
                  </button>

                  {/* Stars */}
                  <div className="flex shrink-0">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={cn(
                          "w-3.5 h-3.5",
                          s <= item.rating ? "fill-warning text-warning" : "text-muted-foreground/20"
                        )}
                      />
                    ))}
                  </div>

                  {/* Category chip */}
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-medium border shrink-0",
                    CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other
                  )}>
                    {CATEGORY_LABELS[item.category] || item.category}
                  </span>

                  {/* Language */}
                  <span className="text-sm shrink-0">{LANG_FLAGS[item.language] || item.language}</span>

                  {/* Sentence */}
                  <span className="text-sm text-foreground truncate flex-1">
                    &ldquo;{item.sentence_text}&rdquo;
                  </span>

                  {/* User */}
                  <span className="text-xs text-muted-foreground truncate max-w-[120px] shrink-0">
                    {item.users?.display_name || item.users?.email || "Unknown"}
                  </span>

                  {/* Time */}
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-border space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Globe className="w-3 h-3" /> Sentence
                          </p>
                          <p className="text-sm italic">&ldquo;{item.sentence_text}&rdquo;</p>
                        </div>

                        {item.comment && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                              <MessageSquare className="w-3 h-3" /> User Comment
                            </p>
                            <p className="text-sm text-foreground bg-background rounded-md p-2.5 border border-border">
                              {item.comment}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {item.users?.email || "Unknown"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <StickyNote className="w-3 h-3" /> Admin Notes
                          </p>
                          <textarea
                            value={adminNotes[item.id] ?? item.admin_notes ?? ""}
                            onChange={(e) =>
                              setAdminNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                            }
                            placeholder="Add internal notes..."
                            rows={3}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                          />
                          <button
                            onClick={() => saveNotes(item)}
                            className="mt-1.5 px-3 py-1 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                          >
                            Save notes
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
