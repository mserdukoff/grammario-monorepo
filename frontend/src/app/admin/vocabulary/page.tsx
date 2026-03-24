"use client"

import { useEffect, useState, useCallback } from "react"
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { authFetch } from "@/lib/auth-fetch"

const LANG_FLAGS: Record<string, string> = { it: "\u{1F1EE}\u{1F1F9}", es: "\u{1F1EA}\u{1F1F8}", de: "\u{1F1E9}\u{1F1EA}", ru: "\u{1F1F7}\u{1F1FA}", tr: "\u{1F1F9}\u{1F1F7}" }

interface Vocab {
  id: string; user_id: string; word: string; lemma: string; translation: string | null
  language: string; part_of_speech: string | null; context: string | null
  mastery: number; ease_factor: number; interval_days: number
  next_review: string | null; review_count: number; created_at: string
}

export default function AdminVocabulary() {
  const [items, setItems] = useState<Vocab[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  const load = useCallback(async (p: number) => {
    try {
      const res = await authFetch(`/api/v1/admin/vocabulary?page=${p}&limit=30`)
      if (res.ok) {
        const data = await res.json()
        setItems(data.items)
        setTotal(data.total)
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { load(page) }, [page, load])

  const totalPages = Math.ceil(total / 30)

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vocabulary</h1>
        <p className="text-sm text-muted-foreground">{total} saved words across all users</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">No vocabulary saved yet</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted border-b border-border">
                    {["Word", "Lemma", "Translation", "Lang", "POS", "Mastery", "Reviews", "Next Review", "Context", "Created"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {items.map(v => (
                    <tr key={v.id} className="hover:bg-surface-2 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground text-xs">{v.word}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground italic">{v.lemma}</td>
                      <td className="px-4 py-3 text-xs text-foreground">{v.translation || "\u2014"}</td>
                      <td className="px-4 py-3">{LANG_FLAGS[v.language]}</td>
                      <td className="px-4 py-3 text-[10px] font-mono text-muted-foreground">{v.part_of_speech || "\u2014"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className={cn("h-full rounded-full", v.mastery >= 80 ? "bg-success" : v.mastery >= 40 ? "bg-warning" : "bg-error")} style={{ width: `${v.mastery}%` }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">{v.mastery}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{v.review_count}</td>
                      <td className="px-4 py-3 text-[10px] text-muted-foreground">{v.next_review || "\u2014"}</td>
                      <td className="px-4 py-3 text-[10px] text-muted-foreground truncate max-w-[200px]">{v.context || "\u2014"}</td>
                      <td className="px-4 py-3 text-[10px] text-muted-foreground whitespace-nowrap">{new Date(v.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 rounded hover:bg-accent disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded hover:bg-accent disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
