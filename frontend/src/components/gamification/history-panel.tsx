"use client"

/**
 * History Panel
 * 
 * Displays recent sentence analyses with the ability to favorite and revisit.
 */
import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Clock, Star, Trash2, ChevronRight, Languages } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Analysis } from "@/lib/supabase/database.types"

interface HistoryPanelProps {
  analyses: Analysis[]
  onSelect: (analysis: Analysis) => void
  onToggleFavorite: (id: string, isFavorite: boolean) => void
  onDelete: (id: string) => void
  loading?: boolean
}

const LANGUAGE_FLAGS: Record<string, string> = {
  it: "🇮🇹",
  es: "🇪🇸",
  de: "🇩🇪",
  ru: "🇷🇺",
  tr: "🇹🇷",
}

export function HistoryPanel({
  analyses,
  onSelect,
  onToggleFavorite,
  onDelete,
  loading = false,
}: HistoryPanelProps) {
  const [filter, setFilter] = useState<"all" | "favorites">("all")

  const filteredAnalyses = filter === "favorites"
    ? analyses.filter((a) => a.is_favorite)
    : analyses

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 rounded-lg bg-slate-800/50 animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (analyses.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 mx-auto text-slate-600 mb-3" />
        <p className="text-muted-foreground">No analyses yet</p>
        <p className="text-sm text-slate-500 mt-1">
          Your sentence history will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "px-3 py-1.5 text-sm rounded-lg transition-colors",
            filter === "all"
              ? "bg-indigo-500/20 text-indigo-400"
              : "text-muted-foreground hover:text-foreground hover:bg-slate-800"
          )}
        >
          All ({analyses.length})
        </button>
        <button
          onClick={() => setFilter("favorites")}
          className={cn(
            "px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1",
            filter === "favorites"
              ? "bg-amber-500/20 text-amber-400"
              : "text-muted-foreground hover:text-foreground hover:bg-slate-800"
          )}
        >
          <Star className="w-3 h-3" />
          Favorites ({analyses.filter((a) => a.is_favorite).length})
        </button>
      </div>

      {/* Analysis list */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {filteredAnalyses.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-4">
            No favorites yet. Star sentences to save them here.
          </p>
        ) : (
          filteredAnalyses.map((analysis) => (
            <div
              key={analysis.id}
              className="group relative rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800/50 transition-colors"
            >
              <button
                onClick={() => onSelect(analysis)}
                className="w-full text-left p-3 pr-24"
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg shrink-0">
                    {LANGUAGE_FLAGS[analysis.language] || "🌐"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{analysis.text}</p>
                    {analysis.translation && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {analysis.translation}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDistanceToNow(new Date(analysis.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>

              {/* Action buttons */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorite(analysis.id, !analysis.is_favorite)
                  }}
                  className={cn(
                    "p-1.5 rounded-md transition-colors",
                    analysis.is_favorite
                      ? "text-amber-400 hover:bg-amber-500/20"
                      : "text-slate-400 hover:bg-slate-700 hover:text-amber-400"
                  )}
                >
                  <Star
                    className={cn("w-4 h-4", analysis.is_favorite && "fill-current")}
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(analysis.id)
                  }}
                  className="p-1.5 rounded-md text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
