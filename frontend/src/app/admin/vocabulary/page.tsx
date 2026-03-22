"use client"

import { useEffect, useState, useCallback } from "react"
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

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
      const res = await fetch(`/api/v1/admin/vocabulary?page=${p}&limit=30`)
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
        <p className="text-sm text-slate-500">{total} saved words across all users</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-slate-500">No vocabulary saved yet</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800">
                    {["Word", "Lemma", "Translation", "Lang", "POS", "Mastery", "Reviews", "Next Review", "Context", "Created"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {items.map(v => (
                    <tr key={v.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-200 text-xs">{v.word}</td>
                      <td className="px-4 py-3 text-xs text-slate-400 italic">{v.lemma}</td>
                      <td className="px-4 py-3 text-xs text-slate-300">{v.translation || "\u2014"}</td>
                      <td className="px-4 py-3">{LANG_FLAGS[v.language]}</td>
                      <td className="px-4 py-3 text-[10px] font-mono text-slate-500">{v.part_of_speech || "\u2014"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div className={cn("h-full rounded-full", v.mastery >= 80 ? "bg-emerald-500" : v.mastery >= 40 ? "bg-yellow-500" : "bg-red-500")} style={{ width: `${v.mastery}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{v.mastery}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 font-mono">{v.review_count}</td>
                      <td className="px-4 py-3 text-[10px] text-slate-500">{v.next_review || "\u2014"}</td>
                      <td className="px-4 py-3 text-[10px] text-slate-500 truncate max-w-[200px]">{v.context || "\u2014"}</td>
                      <td className="px-4 py-3 text-[10px] text-slate-500 whitespace-nowrap">{new Date(v.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
