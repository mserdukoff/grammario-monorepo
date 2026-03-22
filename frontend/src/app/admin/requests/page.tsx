"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import {
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Copy, Check, Trash2, X, ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"

const LANG_FLAGS: Record<string, string> = { it: "\u{1F1EE}\u{1F1F9}", es: "\u{1F1EA}\u{1F1F8}", de: "\u{1F1E9}\u{1F1EA}", ru: "\u{1F1F7}\u{1F1FA}", tr: "\u{1F1F9}\u{1F1F7}" }

interface Analysis {
  id: string; user_id: string; text: string; language: string; translation: string | null
  is_favorite: boolean; created_at: string
  nodes: unknown; pedagogical_data: unknown
  owner: { email: string; display_name: string | null } | null
}

export default function AdminRequests() {
  const searchParams = useSearchParams()
  const focusId = searchParams.get("id")

  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [langFilter, setLangFilter] = useState("")
  const [expanded, setExpanded] = useState<Record<string, "nodes" | "ped" | "full" | null>>({})
  const [copied, setCopied] = useState<string | null>(null)
  const [detail, setDetail] = useState<{ analysis: Analysis; owner: unknown } | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = useCallback(async (p: number, lang: string) => {
    try {
      let url = `/api/v1/admin/analyses?page=${p}&limit=20`
      if (lang) url += `&language=${lang}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setAnalyses(data.analyses)
        setTotal(data.total)
      }
    } catch { /* ignore */ }
  }, [])

  const loadDetail = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/v1/admin/analyses?id=${id}`)
      if (res.ok) {
        const data = await res.json()
        setDetail(data)
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (focusId) {
      loadDetail(focusId)
    } else {
      load(page, langFilter)
    }
  }, [page, langFilter, focusId, load, loadDetail])

  const copyJson = (data: unknown, key: string) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  const toggleExpand = (id: string, section: "nodes" | "ped" | "full") => {
    setExpanded(prev => ({ ...prev, [id]: prev[id] === section ? null : section }))
  }

  const deleteAnalysis = async (id: string) => {
    try {
      const res = await fetch("/api/v1/admin/analyses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis_id: id }),
      })
      if (res.ok) {
        setDeleting(null)
        if (focusId) setDetail(null)
        else load(page, langFilter)
      }
    } catch { /* ignore */ }
  }

  // Detail view for a single analysis
  if (detail || focusId) {
    const a = detail?.analysis
    return (
      <div className="p-6 max-w-[1200px] mx-auto space-y-6">
        <button onClick={() => { setDetail(null); window.history.pushState({}, "", "/admin/requests") }} className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200">
          <ChevronLeft className="w-4 h-4" /> Back to list
        </button>
        {!a ? (
          <div className="text-slate-500 text-center py-20">Loading...</div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold">{a.text}</h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                  <span>{LANG_FLAGS[a.language]} {a.language.toUpperCase()}</span>
                  <span>&middot;</span>
                  <span>{new Date(a.created_at).toLocaleString()}</span>
                  <span>&middot;</span>
                  <span>{(detail?.owner as { email?: string })?.email || a.user_id.slice(0, 8)}</span>
                </div>
                {a.translation && <p className="text-sm text-slate-300 mt-2 italic">&ldquo;{a.translation}&rdquo;</p>}
              </div>
            </div>

            <RawSection title="Full Raw Record" data={a} copyKey={`full-${a.id}`} copied={copied} onCopy={copyJson} />
            <RawSection title="Nodes (Parse Tree)" data={a.nodes} copyKey={`nodes-${a.id}`} copied={copied} onCopy={copyJson} />
            <RawSection title="Pedagogical Data (LLM Response)" data={a.pedagogical_data} copyKey={`ped-${a.id}`} copied={copied} onCopy={copyJson} />
          </>
        )}
      </div>
    )
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Requests & Data</h1>
          <p className="text-sm text-slate-500">{total} total analyses &mdash; raw request/response data</p>
        </div>
        <div className="flex items-center gap-1.5">
          {["", "it", "es", "de", "ru", "tr"].map(lang => (
            <button
              key={lang}
              onClick={() => { setLangFilter(lang); setPage(1) }}
              className={cn(
                "px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors",
                langFilter === lang ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300" : "bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200"
              )}
            >
              {lang ? `${LANG_FLAGS[lang]} ${lang.toUpperCase()}` : "All"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {analyses.map(a => {
          const exp = expanded[a.id]
          return (
            <div key={a.id} className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
              {/* Row header */}
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="text-sm">{LANG_FLAGS[a.language]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate font-medium">{a.text}</p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {a.owner?.display_name || a.owner?.email || a.user_id.slice(0, 8)} &middot; {new Date(a.created_at).toLocaleString()}
                    {a.translation && <> &middot; <span className="italic text-slate-400">{a.translation}</span></>}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => window.location.href = `/admin/requests?id=${a.id}`} className="p-1.5 rounded hover:bg-slate-700 text-slate-500 hover:text-slate-200" title="Full detail">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => toggleExpand(a.id, "nodes")} className={cn("p-1.5 rounded text-[10px] font-mono border transition-colors", exp === "nodes" ? "bg-blue-500/20 border-blue-500/30 text-blue-300" : "border-slate-700 text-slate-500 hover:text-slate-300")}>
                    nodes
                  </button>
                  <button onClick={() => toggleExpand(a.id, "ped")} className={cn("p-1.5 rounded text-[10px] font-mono border transition-colors", exp === "ped" ? "bg-purple-500/20 border-purple-500/30 text-purple-300" : "border-slate-700 text-slate-500 hover:text-slate-300")}>
                    ped
                  </button>
                  <button onClick={() => toggleExpand(a.id, "full")} className={cn("p-1.5 rounded text-[10px] font-mono border transition-colors", exp === "full" ? "bg-amber-500/20 border-amber-500/30 text-amber-300" : "border-slate-700 text-slate-500 hover:text-slate-300")}>
                    raw
                  </button>
                  <button onClick={() => copyJson(a, `row-${a.id}`)} className="p-1.5 rounded hover:bg-slate-700 text-slate-500" title="Copy JSON">
                    {copied === `row-${a.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  {deleting === a.id ? (
                    <div className="flex items-center gap-1 ml-1">
                      <button onClick={() => deleteAnalysis(a.id)} className="text-[9px] px-1.5 py-0.5 rounded bg-red-600 text-white">Yes</button>
                      <button onClick={() => setDeleting(null)} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleting(a.id)} className="p-1.5 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded content */}
              {exp && (
                <div className="border-t border-slate-800 p-4 bg-slate-950/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {exp === "nodes" ? "Parse Tree Nodes" : exp === "ped" ? "Pedagogical Data" : "Full Raw Record"}
                    </span>
                    <button onClick={() => copyJson(exp === "nodes" ? a.nodes : exp === "ped" ? a.pedagogical_data : a, `exp-${a.id}`)} className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1">
                      {copied === `exp-${a.id}` ? <><Check className="w-3 h-3 text-emerald-400" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto max-h-[500px] overflow-y-auto leading-relaxed whitespace-pre-wrap">
                    {JSON.stringify(exp === "nodes" ? a.nodes : exp === "ped" ? a.pedagogical_data : a, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )
        })}

        {analyses.length === 0 && (
          <div className="text-center py-20 text-slate-500">No analyses found</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  )
}

function RawSection({ title, data, copyKey, copied, onCopy }: {
  title: string; data: unknown; copyKey: string
  copied: string | null; onCopy: (data: unknown, key: string) => void
}) {
  const [open, setOpen] = useState(true)
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full px-4 py-3 hover:bg-slate-800/50 transition-colors">
        <span className="text-sm font-semibold text-slate-300">{title}</span>
        <div className="flex items-center gap-2">
          <button onClick={e => { e.stopPropagation(); onCopy(data, copyKey) }} className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1 px-2 py-0.5 rounded border border-slate-700 hover:border-slate-600">
            {copied === copyKey ? <><Check className="w-3 h-3 text-emerald-400" /> Copied</> : <><Copy className="w-3 h-3" /> Copy JSON</>}
          </button>
          {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </button>
      {open && (
        <div className="border-t border-slate-800 p-4 bg-slate-950/50">
          <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto max-h-[600px] overflow-y-auto leading-relaxed whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
