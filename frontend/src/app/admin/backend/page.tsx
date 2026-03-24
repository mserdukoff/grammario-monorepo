"use client"

import { useEffect, useState, useCallback } from "react"
import {
  RefreshCw, CheckCircle, XCircle, AlertTriangle,
  Cpu, HardDrive, Zap, Database,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { authFetch } from "@/lib/auth-fetch"

const LANG_FLAGS: Record<string, string> = { it: "\u{1F1EE}\u{1F1F9}", es: "\u{1F1EA}\u{1F1F8}", de: "\u{1F1E9}\u{1F1EA}", ru: "\u{1F1F7}\u{1F1FA}", tr: "\u{1F1F9}\u{1F1F7}" }

interface BackendHealth {
  status?: string; version?: string; message?: string
  services?: { llm: boolean; cache: { available: boolean; hits: number; misses: number; hit_rate: number }; embeddings: boolean }
  engines?: {
    preferred: string
    spacy: { available: boolean; loaded: string[]; supported: string[] }
    stanza: { loaded: string[]; max_loaded: number; supported: string[] }
  }
  features?: Record<string, unknown>
  memory?: { rss_mb: number; vms_mb: number }
}

export default function AdminBackend() {
  const [health, setHealth] = useState<BackendHealth | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [rawOpen, setRawOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await authFetch("/api/v1/admin/health")
      const data = await res.json()
      if (res.ok) {
        setHealth(data)
        setError(null)
      } else {
        setError(data.message || `Status ${res.status}`)
        setHealth(data)
      }
    } catch {
      setError("Failed to reach health endpoint")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Backend Health</h1>
          <p className="text-sm text-muted-foreground">Live system monitoring</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card hover:bg-accent border border-border text-xs transition-colors disabled:opacity-50">
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} /> Refresh
        </button>
      </div>

      {/* Status banner */}
      <div className={cn(
        "rounded-xl border p-5 flex items-center gap-4",
        error ? "bg-error-light border-error/30" : health?.status === "healthy" ? "bg-success-light border-success/30" : "bg-warning-light border-warning/30"
      )}>
        {error ? <XCircle className="w-6 h-6 text-error shrink-0" /> : health?.status === "healthy" ? <CheckCircle className="w-6 h-6 text-success shrink-0" /> : <AlertTriangle className="w-6 h-6 text-warning shrink-0" />}
        <div>
          <p className="font-semibold">{error ? "Backend Unreachable" : health?.status === "healthy" ? "Backend Healthy" : "Status Unknown"}</p>
          {error && <p className="text-sm text-error mt-0.5">{error}</p>}
          {health?.version && <p className="text-xs text-muted-foreground">v{health.version}</p>}
        </div>
      </div>

      {health && !error && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Services */}
          <Card title="Services" icon={Zap} iconColor="text-warning">
            <div className="space-y-3">
              <StatusRow label="LLM" active={health.services?.llm ?? false} />
              <StatusRow label="Redis Cache" active={health.services?.cache?.available ?? false} />
              <StatusRow label="Embeddings" active={health.services?.embeddings ?? false} />
            </div>
            {health.services?.cache?.available && (
              <div className="pt-4 mt-4 border-t border-border grid grid-cols-3 gap-3 text-center">
                <div><p className="text-lg font-bold tabular-nums">{health.services.cache.hits}</p><p className="text-[9px] text-muted-foreground uppercase">Hits</p></div>
                <div><p className="text-lg font-bold tabular-nums">{health.services.cache.misses}</p><p className="text-[9px] text-muted-foreground uppercase">Misses</p></div>
                <div><p className="text-lg font-bold tabular-nums">{(health.services.cache.hit_rate * 100).toFixed(1)}%</p><p className="text-[9px] text-muted-foreground uppercase">Hit Rate</p></div>
              </div>
            )}
          </Card>

          {/* NLP Engines */}
          <Card title="NLP Engines" icon={Cpu} iconColor="text-primary" subtitle={`preferred: ${health.engines?.preferred}`}>
            {health.engines?.spacy && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">spaCy</span>
                  <Dot active={health.engines.spacy.available} />
                </div>
                <div className="flex flex-wrap gap-1">
                  {health.engines.spacy.supported.map(lang => (
                    <span key={lang} className={cn("px-2 py-0.5 rounded text-[10px] border", health.engines!.spacy.loaded.includes(lang) ? "bg-success-light border-success/30 text-success" : "bg-muted border-border text-muted-foreground")}>
                      {LANG_FLAGS[lang]} {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {health.engines?.stanza && (
              <div className="space-y-2 pt-3 mt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Stanza</span>
                  <span className="text-[10px] text-muted-foreground">max: {health.engines.stanza.max_loaded}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {health.engines.stanza.supported.map(lang => (
                    <span key={lang} className={cn("px-2 py-0.5 rounded text-[10px] border", health.engines!.stanza.loaded.includes(lang) ? "bg-success-light border-success/30 text-success" : "bg-muted border-border text-muted-foreground")}>
                      {LANG_FLAGS[lang]} {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Features */}
          {health.features && (
            <Card title="Features" icon={Database} iconColor="text-primary">
              <div className="space-y-2.5">
                {Object.entries(health.features).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{key.replace(/_/g, " ")}</span>
                    <span className="text-xs font-mono">
                      {typeof value === "boolean" ? (value ? <CheckCircle className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-error" />) : Array.isArray(value) ? <span className="text-foreground">{value.join(", ")}</span> : <span className="text-foreground">{String(value)}</span>}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Memory */}
          {health.memory && (
            <Card title="Memory Usage" icon={HardDrive} iconColor="text-warning">
              <div className="grid grid-cols-2 gap-6 mb-4">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">RSS (Resident)</p>
                  <p className="text-2xl font-bold tabular-nums">{health.memory.rss_mb} <span className="text-sm font-normal text-muted-foreground">MB</span></p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">VMS (Virtual)</p>
                  <p className="text-2xl font-bold tabular-nums">{health.memory.vms_mb} <span className="text-sm font-normal text-muted-foreground">MB</span></p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>RSS</span>
                  <span>{health.memory.rss_mb} / 3500 MB</span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all", health.memory.rss_mb > 2800 ? "bg-error" : health.memory.rss_mb > 2000 ? "bg-warning" : "bg-success")} style={{ width: `${Math.min((health.memory.rss_mb / 3500) * 100, 100)}%` }} />
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Raw JSON */}
      {health && (
        <div className="rounded-xl border border-border bg-surface-2 overflow-hidden">
          <button onClick={() => setRawOpen(!rawOpen)} className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent transition-colors text-sm font-semibold text-muted-foreground">
            Raw Health Response
            <span className="text-[10px] text-muted-foreground">{rawOpen ? "collapse" : "expand"}</span>
          </button>
          {rawOpen && (
            <div className="border-t border-border p-4 bg-muted">
              <pre className="text-[11px] font-mono text-foreground overflow-auto max-h-[500px] whitespace-pre-wrap">
                {JSON.stringify(health, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Card({ title, icon: Icon, iconColor, subtitle, children }: {
  title: string; icon: React.ComponentType<{ className?: string }>; iconColor: string
  subtitle?: string; children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Icon className={cn("w-4 h-4", iconColor)} />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && <span className="text-[10px] text-muted-foreground ml-auto">{subtitle}</span>}
      </div>
      {children}
    </div>
  )
}

function StatusRow({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-foreground">{label}</span>
      <Dot active={active} />
    </div>
  )
}

function Dot({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("w-2 h-2 rounded-full", active ? "bg-success" : "bg-error")} />
      <span className={cn("text-[10px]", active ? "text-success" : "text-error")}>{active ? "Active" : "Down"}</span>
    </div>
  )
}
