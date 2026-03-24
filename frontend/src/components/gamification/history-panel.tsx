"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Clock, Star, Trash2, ChevronRight } from "lucide-react"
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
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-md bg-surface-2 animate-pulse" />
        ))}
      </div>
    )
  }

  if (analyses.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No analyses yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Your history will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "px-2.5 py-1 text-xs rounded-md transition-colors",
            filter === "all"
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          All ({analyses.length})
        </button>
        <button
          onClick={() => setFilter("favorites")}
          className={cn(
            "px-2.5 py-1 text-xs rounded-md transition-colors flex items-center gap-1",
            filter === "favorites"
              ? "bg-warning-light text-warning font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <Star className="w-3 h-3" />
          ({analyses.filter((a) => a.is_favorite).length})
        </button>
      </div>

      <div className="space-y-1 max-h-[400px] overflow-y-auto">
        {filteredAnalyses.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-4">
            No favorites yet.
          </p>
        ) : (
          filteredAnalyses.map((analysis) => (
            <div
              key={analysis.id}
              className="group relative rounded-md hover:bg-accent transition-colors"
            >
              <button
                onClick={() => onSelect(analysis)}
                className="w-full text-left p-2.5 pr-16"
              >
                <div className="flex items-start gap-2">
                  <span className="text-sm shrink-0">
                    {LANGUAGE_FLAGS[analysis.language] || "🌐"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{analysis.text}</p>
                    {analysis.translation && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {analysis.translation}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(analysis.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </button>

              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorite(analysis.id, !analysis.is_favorite)
                  }}
                  className={cn(
                    "p-1 rounded transition-colors",
                    analysis.is_favorite
                      ? "text-warning"
                      : "text-muted-foreground hover:text-warning"
                  )}
                >
                  <Star className={cn("w-3.5 h-3.5", analysis.is_favorite && "fill-current")} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(analysis.id)
                  }}
                  className="p-1 rounded text-muted-foreground hover:text-error transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
