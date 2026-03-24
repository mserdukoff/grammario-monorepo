"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  Users, BarChart3, BookOpen, Activity, RefreshCw,
  Zap, TrendingUp, Crown, Globe, ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { authFetch } from "@/lib/auth-fetch"

const LANG_FLAGS: Record<string, string> = { it: "\u{1F1EE}\u{1F1F9}", es: "\u{1F1EA}\u{1F1F8}", de: "\u{1F1E9}\u{1F1EA}", ru: "\u{1F1F7}\u{1F1FA}", tr: "\u{1F1F9}\u{1F1F7}" }
const LANG_NAMES: Record<string, string> = { it: "Italian", es: "Spanish", de: "German", ru: "Russian", tr: "Turkish" }

interface Stats {
  users: { total: number; active_this_week: number; pro: number }
  analyses: { total: number; today: number; this_week: number; by_language: Record<string, number> }
  vocabulary: { total: number; mastered: number }
  recent_analyses: { id: string; text: string; language: string; created_at: string; user_id: string }[]
  recent_users: { id: string; email: string; display_name: string | null; created_at: string }[]
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await authFetch("/api/v1/admin/stats")
      if (res.ok) setStats(await res.json())
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { load() }, [load])

  const refresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Overview</h1>
          <p className="text-sm text-muted-foreground">Platform-wide statistics and activity</p>
        </div>
        <button onClick={refresh} disabled={refreshing} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card hover:bg-accent border border-border text-xs transition-colors disabled:opacity-50">
          <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} /> Refresh
        </button>
      </div>

      {!stats ? (
        <div className="text-center py-20 text-muted-foreground">Loading stats...</div>
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPI icon={Users} label="Total Users" value={stats.users.total} color="indigo" />
            <KPI icon={Activity} label="Active This Week" value={stats.users.active_this_week} color="emerald" />
            <KPI icon={BarChart3} label="Total Analyses" value={stats.analyses.total} color="blue" />
            <KPI icon={Zap} label="Analyses Today" value={stats.analyses.today} color="amber" />
            <KPI icon={TrendingUp} label="This Week" value={stats.analyses.this_week} color="cyan" />
            <KPI icon={Crown} label="Pro Users" value={stats.users.pro} color="purple" />
            <KPI icon={BookOpen} label="Vocabulary" value={stats.vocabulary.total} sub={`${stats.vocabulary.mastered} mastered`} color="green" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Language breakdown */}
            <div className="rounded-xl border border-border bg-surface-2 p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" /> Analyses by Language
              </h2>
              {Object.keys(stats.analyses.by_language).length === 0 ? (
                <p className="text-xs text-muted-foreground">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(stats.analyses.by_language).sort(([,a],[,b]) => b - a).map(([lang, count]) => (
                    <div key={lang} className="flex items-center gap-3">
                      <span className="text-base w-6 text-center">{LANG_FLAGS[lang]}</span>
                      <span className="text-sm text-foreground w-16">{LANG_NAMES[lang]}</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max((count / stats.analyses.total) * 100, 4)}%` }} />
                      </div>
                      <span className="text-sm font-mono text-muted-foreground w-8 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent activity */}
            <div className="rounded-xl border border-border bg-surface-2 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4 text-success" /> Recent Analyses
                </h2>
                <Link href="/admin/requests" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {stats.recent_analyses.map((a) => (
                  <Link
                    key={a.id}
                    href={`/admin/requests?id=${a.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-2 transition-colors group"
                  >
                    <span className="text-sm">{LANG_FLAGS[a.language]}</span>
                    <span className="text-sm text-foreground truncate flex-1 transition-colors">{a.text}</span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(a.created_at).toLocaleDateString()}</span>
                  </Link>
                ))}
                {stats.recent_analyses.length === 0 && <p className="text-xs text-muted-foreground">No analyses yet</p>}
              </div>
            </div>
          </div>

          {/* Recent users */}
          <div className="rounded-xl border border-border bg-surface-2 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Recent Sign-ups
              </h2>
              <Link href="/admin/users" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {stats.recent_users.map((u) => (
                <div key={u.id} className="flex items-center gap-3 p-2">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0">
                    {(u.display_name || u.email)[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{u.display_name || u.email}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(u.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function KPI({ icon: Icon, label, value, sub, color }: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: number; sub?: string
  color: string
}) {
  const colors: Record<string, string> = {
    indigo: "text-primary bg-primary/10 border-primary/20",
    emerald: "text-success bg-success-light border-success/20",
    blue: "text-primary bg-primary/10 border-primary/20",
    amber: "text-warning bg-warning-light border-warning/20",
    cyan: "text-primary bg-primary/10 border-primary/20",
    purple: "text-primary bg-primary/10 border-primary/20",
    green: "text-success bg-success-light border-success/20",
  }
  return (
    <div className="rounded-xl border border-border bg-surface-2 p-4 flex items-start gap-3">
      <div className={cn("p-2 rounded-lg border", colors[color])}><Icon className="w-4 h-4" /></div>
      <div>
        <p className="text-[11px] text-muted-foreground mb-0.5">{label}</p>
        <p className="text-xl font-bold tabular-nums">{value.toLocaleString()}</p>
        {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
