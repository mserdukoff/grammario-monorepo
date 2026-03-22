"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Search, ChevronLeft, ChevronRight, Crown, Pencil, Trash2,
  X, Check, Shield,
} from "lucide-react"
import { ADMIN_USER_ID } from "@/lib/admin"
import { cn } from "@/lib/utils"

interface UserRow {
  id: string; email: string; display_name: string | null; avatar_url: string | null
  is_pro: boolean; xp: number; level: number; streak: number; longest_streak: number
  total_analyses: number; last_active_date: string | null; created_at: string
  stripe_customer_id: string | null; subscription_status: string | null
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, unknown>>({})
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = useCallback(async (p: number) => {
    try {
      const res = await fetch(`/api/v1/admin/users?page=${p}&limit=30`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
        setTotal(data.total)
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { load(page) }, [page, load])

  const filtered = search
    ? users.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.display_name || "").toLowerCase().includes(search.toLowerCase()) ||
        u.id.includes(search)
      )
    : users

  const totalPages = Math.ceil(total / 30)

  const startEdit = (u: UserRow) => {
    setEditing(u.id)
    setEditValues({ display_name: u.display_name, is_pro: u.is_pro, xp: u.xp, level: u.level })
  }

  const saveEdit = async () => {
    if (!editing) return
    try {
      const res = await fetch("/api/v1/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: editing, updates: editValues }),
      })
      if (res.ok) {
        setEditing(null)
        load(page)
      }
    } catch { /* ignore */ }
  }

  const confirmDelete = async (userId: string) => {
    try {
      const res = await fetch("/api/v1/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      })
      if (res.ok) {
        setDeleting(null)
        load(page)
      }
    } catch { /* ignore */ }
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-slate-500">{total} registered users</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Filter by name, email, or ID..."
            className="pl-9 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 w-72"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800">
                {["User", "ID", "Level / XP", "Streak", "Analyses", "Status", "Last Active", "Joined", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="w-7 h-7 rounded-full" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                          {(u.display_name || u.email)[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        {editing === u.id ? (
                          <input
                            value={(editValues.display_name as string) || ""}
                            onChange={e => setEditValues(v => ({ ...v, display_name: e.target.value }))}
                            className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-sm w-40 focus:outline-none"
                          />
                        ) : (
                          <p className="text-slate-200 truncate max-w-[180px] font-medium text-xs">{u.display_name || "\u2014"}</p>
                        )}
                        <p className="text-[10px] text-slate-500 truncate max-w-[180px]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-[10px] text-slate-500 font-mono">{u.id.slice(0, 8)}</code>
                    {u.id === ADMIN_USER_ID && <Shield className="w-3 h-3 text-red-400 inline ml-1" />}
                  </td>
                  <td className="px-4 py-3">
                    {editing === u.id ? (
                      <div className="flex gap-1">
                        <input type="number" value={editValues.level as number} onChange={e => setEditValues(v => ({ ...v, level: parseInt(e.target.value) || 1 }))} className="bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-xs w-12 focus:outline-none" />
                        <input type="number" value={editValues.xp as number} onChange={e => setEditValues(v => ({ ...v, xp: parseInt(e.target.value) || 0 }))} className="bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-xs w-16 focus:outline-none" />
                      </div>
                    ) : (
                      <>
                        <span className="font-mono text-slate-300 text-xs">Lv{u.level}</span>
                        <span className="text-[10px] text-slate-500 ml-1">({u.xp} XP)</span>
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className="text-orange-400 font-mono">{u.streak}</span>
                    <span className="text-[10px] text-slate-500 ml-1">(best: {u.longest_streak})</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300 text-xs">{u.total_analyses}</td>
                  <td className="px-4 py-3">
                    {editing === u.id ? (
                      <button
                        onClick={() => setEditValues(v => ({ ...v, is_pro: !(v.is_pro as boolean) }))}
                        className={cn("text-[10px] px-2 py-0.5 rounded-full border", editValues.is_pro ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-slate-800 text-slate-500 border-slate-700")}
                      >
                        {editValues.is_pro ? "PRO" : "Free"}
                      </button>
                    ) : u.is_pro ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Crown className="w-2.5 h-2.5" /> PRO
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Free</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[10px] text-slate-400">{u.last_active_date || "Never"}</td>
                  <td className="px-4 py-3 text-[10px] text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {editing === u.id ? (
                        <>
                          <button onClick={saveEdit} className="p-1 rounded hover:bg-emerald-500/20 text-emerald-400"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setEditing(null)} className="p-1 rounded hover:bg-slate-700 text-slate-400"><X className="w-3.5 h-3.5" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(u)} className="p-1 rounded hover:bg-slate-700 text-slate-400"><Pencil className="w-3.5 h-3.5" /></button>
                          {u.id !== ADMIN_USER_ID && (
                            deleting === u.id ? (
                              <div className="flex items-center gap-1 ml-1">
                                <button onClick={() => confirmDelete(u.id)} className="text-[10px] px-2 py-0.5 rounded bg-red-600 text-white hover:bg-red-500">Confirm</button>
                                <button onClick={() => setDeleting(null)} className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 hover:bg-slate-600">Cancel</button>
                              </div>
                            ) : (
                              <button onClick={() => setDeleting(u.id)} className="p-1 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                            )
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-500 text-sm">No users found</td></tr>
              )}
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
    </div>
  )
}
