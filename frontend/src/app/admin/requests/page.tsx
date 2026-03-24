"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import {
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Copy, Check, Trash2, X, ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { authFetch } from "@/lib/auth-fetch"

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
      const res = await authFetch(url)
      if (res.ok) {
        const data = await res.json()
        setAnalyses(data.analyses)
        setTotal(data.total)
      }
    } catch { /* ignore */ }
  }, [])

  const loadDetail = useCallback(async (id: string) => {
    try {
      const res = await authFetch(`/api/v1/admin/analyses?id=${id}`)
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
      const res = await authFetch("/api/v1/admin/analyses", {
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
        <button onClick={() => { setDetail(null); window.history.pushState({}, "", "/admin/requests") }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4" /> Back to list
        </button>
        {!a ? (
          <div className="text-muted-foreground text-center py-20">Loading...</div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold">{a.text}</h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span>{LANG_FLAGS[a.language]} {a.language.toUpperCase()}</span>
                  <span>&middot;</span>
                  <span>{new Date(a.created_at).toLocaleString()}</span>
                  <span>&middot;</span>
                  <span>{(detail?.owner as { email?: string })?.email || a.user_id.slice(0, 8)}</span>
                </div>
                {a.translation && <p className="text-sm text-foreground mt-2 italic">&ldquo;{a.translation}&rdquo;</p>}
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
          <p className="text-sm text-muted-foreground">{total} total analyses &mdash; raw request/response data</p>
        </div>
        <div className="flex items-center gap-1.5">
          {["", "it", "es", "de", "ru", "tr"].map(lang => (
            <button
              key={lang}
              onClick={() => { setLangFilter(lang); setPage(1) }}
              className={cn(
                "px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors",
                langFilter === lang ? "bg-primary/10 border-primary/40 text-primary" : "bg-background border-border text-muted-foreground hover:text-foreground"
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
            <div key={a.id} className="rounded-xl border border-border bg-surface-2 overflow-hidden">
              {/* Row header */}
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="text-sm">{LANG_FLAGS[a.language]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate font-medium">{a.text}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {a.owner?.display_name || a.owner?.email || a.user_id.slice(0, 8)} &middot; {new Date(a.created_at).toLocaleString()}
                    {a.translation && <> &middot; <span className="italic text-muted-foreground">{a.translation}</span></>}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => window.location.href = `/admin/requests?id=${a.id}`} className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground" title="Full detail">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => toggleExpand(a.id, "nodes")} className={cn("p-1.5 rounded text-[10px] font-mono border transition-colors", exp === "nodes" ? "bg-primary/10 border-primary/30 text-primary" : "border-border text-muted-foreground hover:text-foreground")}>
                    nodes
                  </button>
                  <button onClick={() => toggleExpand(a.id, "ped")} className={cn("p-1.5 rounded text-[10px] font-mono border transition-colors", exp === "ped" ? "bg-primary/10 border-primary/30 text-primary" : "border-border text-muted-foreground hover:text-foreground")}>
                    ped
                  </button>
                  <button onClick={() => toggleExpand(a.id, "full")} className={cn("p-1.5 rounded text-[10px] font-mono border transition-colors", exp === "full" ? "bg-warning-light border-warning/30 text-warning" : "border-border text-muted-foreground hover:text-foreground")}>
                    raw
                  </button>
                  <button onClick={() => copyJson(a, `row-${a.id}`)} className="p-1.5 rounded hover:bg-accent text-muted-foreground" title="Copy JSON">
                    {copied === `row-${a.id}` ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  {deleting === a.id ? (
                    <div className="flex items-center gap-1 ml-1">
                      <button onClick={() => deleteAnalysis(a.id)} className="text-[9px] px-1.5 py-0.5 rounded bg-red-600 text-white">Yes</button>
                      <button onClick={() => setDeleting(null)} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-foreground">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleting(a.id)} className="p-1.5 rounded hover:bg-error-light text-muted-foreground hover:text-error" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded content */}
              {exp && (
                <div className="border-t border-border p-4 bg-muted">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {exp === "nodes" ? "Parse Tree Nodes" : exp === "ped" ? "Pedagogical Data" : "Full Raw Record"}
                    </span>
                    <button onClick={() => copyJson(exp === "nodes" ? a.nodes : exp === "ped" ? a.pedagogical_data : a, `exp-${a.id}`)} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
                      {copied === `exp-${a.id}` ? <><Check className="w-3 h-3 text-success" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono text-foreground overflow-x-auto max-h-[500px] overflow-y-auto leading-relaxed whitespace-pre-wrap">
                    {JSON.stringify(exp === "nodes" ? a.nodes : exp === "ped" ? a.pedagogical_data : a, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )
        })}

        {analyses.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">No analyses found</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 rounded hover:bg-accent disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded hover:bg-accent disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
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
    <div className="rounded-xl border border-border bg-surface-2 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent transition-colors">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <div className="flex items-center gap-2">
          <button onClick={e => { e.stopPropagation(); onCopy(data, copyKey) }} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-0.5 rounded border border-border hover:bg-muted/50">
            {copied === copyKey ? <><Check className="w-3 h-3 text-success" /> Copied</> : <><Copy className="w-3 h-3" /> Copy JSON</>}
          </button>
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>
      {open && (
        <div className="border-t border-border p-4 bg-muted">
          <pre className="text-[11px] font-mono text-foreground overflow-x-auto max-h-[600px] overflow-y-auto leading-relaxed whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
