"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Search, ChevronLeft, ChevronRight, Crown, Pencil, Trash2,
  X, Check, Shield, UserPlus, Loader2, Clock, AlertTriangle,
} from "lucide-react"
import { ADMIN_USER_ID } from "@/lib/admin"
import { cn } from "@/lib/utils"
import { authFetch } from "@/lib/auth-fetch"

type AccountType = "regular" | "test"

interface UserRow {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  is_pro: boolean
  xp: number
  level: number
  streak: number
  longest_streak: number
  total_analyses: number
  last_active_date: string | null
  created_at: string
  stripe_customer_id: string | null
  subscription_status: string | null
  account_type: AccountType
  daily_sentence_limit: number | null
  account_expires_at: string | null
  admin_notes: string | null
}

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  regular: "Regular",
  test: "Test",
}

const ACCOUNT_TYPE_STYLES: Record<AccountType, string> = {
  regular: "bg-muted text-muted-foreground border-border",
  test: "bg-primary/10 text-primary border-primary/20",
}

const FILTER_TABS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "test", label: "Test" },
  { value: "regular", label: "Regular" },
]

const TABLE_HEADERS = [
  "User", "ID", "Type", "Limit", "Expires",
  "Level / XP", "Analyses", "Status", "Joined", "Actions",
]

function isExpired(dateStr: string | null): boolean {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "\u2014"
  return new Date(dateStr).toLocaleDateString()
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [editing, setEditing] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, unknown>>({})
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    display_name: "",
    daily_sentence_limit: "",
    account_type: "test" as AccountType,
    account_expires_at: "",
    admin_notes: "",
  })

  const load = useCallback(async (p: number, acctType: string) => {
    try {
      const params = new URLSearchParams({ page: String(p), limit: "30" })
      if (acctType !== "all") params.set("account_type", acctType)
      const res = await authFetch(`/api/v1/admin/users?${params}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
        setTotal(data.total)
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { load(page, typeFilter) }, [page, typeFilter, load])

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
    setEditValues({
      display_name: u.display_name,
      is_pro: u.is_pro,
      xp: u.xp,
      level: u.level,
      account_type: u.account_type,
      daily_sentence_limit: u.daily_sentence_limit ?? "",
      account_expires_at: u.account_expires_at ? u.account_expires_at.split("T")[0] : "",
      admin_notes: u.admin_notes ?? "",
    })
  }

  const saveEdit = async () => {
    if (!editing) return
    const updates: Record<string, unknown> = { ...editValues }
    if (updates.daily_sentence_limit === "" || updates.daily_sentence_limit === null) {
      updates.daily_sentence_limit = null
    } else {
      updates.daily_sentence_limit = parseInt(String(updates.daily_sentence_limit)) || null
    }
    if (updates.account_expires_at === "") {
      updates.account_expires_at = null
    } else {
      updates.account_expires_at = new Date(String(updates.account_expires_at)).toISOString()
    }
    try {
      const res = await authFetch("/api/v1/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: editing, updates }),
      })
      if (res.ok) {
        setEditing(null)
        load(page, typeFilter)
      }
    } catch { /* ignore */ }
  }

  const confirmDelete = async (userId: string) => {
    try {
      const res = await authFetch("/api/v1/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      })
      if (res.ok) {
        setDeleting(null)
        load(page, typeFilter)
      }
    } catch { /* ignore */ }
  }

  const handleCreate = async () => {
    setCreateError("")
    if (!createForm.email || !createForm.password) {
      setCreateError("Email and password are required.")
      return
    }
    setCreating(true)
    try {
      const body: Record<string, unknown> = {
        email: createForm.email,
        password: createForm.password,
        display_name: createForm.display_name || undefined,
        account_type: createForm.account_type,
        admin_notes: createForm.admin_notes || undefined,
        daily_sentence_limit: createForm.daily_sentence_limit
          ? parseInt(createForm.daily_sentence_limit)
          : null,
        account_expires_at: createForm.account_expires_at
          ? new Date(createForm.account_expires_at).toISOString()
          : null,
      }
      const res = await authFetch("/api/v1/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setCreateError(data.error || "Failed to create account")
      } else {
        setShowCreate(false)
        setCreateForm({
          email: "", password: "", display_name: "",
          daily_sentence_limit: "", account_type: "test",
          account_expires_at: "", admin_notes: "",
        })
        load(page, typeFilter)
      }
    } catch {
      setCreateError("Network error")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">{total} registered users</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Filter by name, email, or ID..."
              className="pl-9 pr-4 py-2 rounded-lg bg-background border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 w-72"
            />
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Create Account
          </button>
        </div>
      </div>

      {/* Create Account Form */}
      {showCreate && (
        <div className="rounded-xl border border-primary/20 bg-surface-2 p-6">
          <h2 className="text-sm font-semibold mb-4">Create Test Account</h2>
          {createError && (
            <div className="mb-4 p-3 rounded-lg bg-error-light text-error text-xs flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {createError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Email *</label>
              <input
                type="email" value={createForm.email}
                onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
                placeholder="teacher@university.edu"
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Temporary Password *</label>
              <input
                type="text" value={createForm.password}
                onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                placeholder="min 6 characters"
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Display Name</label>
              <input
                type="text" value={createForm.display_name}
                onChange={e => setCreateForm(f => ({ ...f, display_name: e.target.value }))}
                placeholder="Prof. Smith"
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Account Type</label>
              <select
                value={createForm.account_type}
                onChange={e => setCreateForm(f => ({ ...f, account_type: e.target.value as AccountType }))}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary/50"
              >
                <option value="test">Test</option>
                <option value="regular">Regular</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Daily Sentence Limit</label>
              <input
                type="number" min="1" value={createForm.daily_sentence_limit}
                onChange={e => setCreateForm(f => ({ ...f, daily_sentence_limit: e.target.value }))}
                placeholder="Leave blank for default (50)"
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Expires On</label>
              <input
                type="date" value={createForm.account_expires_at}
                onChange={e => setCreateForm(f => ({ ...f, account_expires_at: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Admin Notes</label>
              <input
                type="text" value={createForm.admin_notes}
                onChange={e => setCreateForm(f => ({ ...f, admin_notes: e.target.value }))}
                placeholder="e.g. Italian professor at MIT, testing for Spring 2026 semester"
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Create Account
            </button>
            <button
              onClick={() => { setShowCreate(false); setCreateError("") }}
              className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm hover:bg-accent transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => { setTypeFilter(tab.value); setPage(1) }}
            className={cn(
              "px-4 py-2 text-xs font-medium border-b-2 transition-colors -mb-px",
              typeFilter === tab.value
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted border-b border-border">
                {TABLE_HEADERS.map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.map(u => {
                const expired = isExpired(u.account_expires_at)
                return (
                  <tr key={u.id} className={cn("hover:bg-surface-2 transition-colors", expired && "opacity-60")}>
                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt="" className="w-7 h-7 rounded-full" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0">
                            {(u.display_name || u.email)[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          {editing === u.id ? (
                            <input
                              value={(editValues.display_name as string) || ""}
                              onChange={e => setEditValues(v => ({ ...v, display_name: e.target.value }))}
                              className="bg-card border border-border rounded px-2 py-0.5 text-sm w-40 focus:outline-none"
                            />
                          ) : (
                            <p className="text-foreground truncate max-w-[180px] font-medium text-xs">{u.display_name || "\u2014"}</p>
                          )}
                          <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">{u.email}</p>
                          {u.admin_notes && !editing && (
                            <p className="text-[9px] text-muted-foreground/70 truncate max-w-[180px] italic mt-0.5">{u.admin_notes}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* ID */}
                    <td className="px-4 py-3">
                      <code className="text-[10px] text-muted-foreground font-mono">{u.id.slice(0, 8)}</code>
                      {u.id === ADMIN_USER_ID && <Shield className="w-3 h-3 text-error inline ml-1" />}
                    </td>

                    {/* Account Type */}
                    <td className="px-4 py-3">
                      {editing === u.id ? (
                        <select
                          value={editValues.account_type as string}
                          onChange={e => setEditValues(v => ({ ...v, account_type: e.target.value }))}
                          className="bg-card border border-border rounded px-1.5 py-0.5 text-[10px] focus:outline-none"
                        >
                          <option value="regular">Regular</option>
                          <option value="test">Test</option>
                        </select>
                      ) : (
                        <span className={cn(
                          "inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border",
                          ACCOUNT_TYPE_STYLES[u.account_type || "regular"]
                        )}>
                          {ACCOUNT_TYPE_LABELS[u.account_type || "regular"]}
                        </span>
                      )}
                    </td>

                    {/* Daily Limit */}
                    <td className="px-4 py-3">
                      {editing === u.id ? (
                        <input
                          type="number" min="1"
                          value={editValues.daily_sentence_limit as string}
                          onChange={e => setEditValues(v => ({ ...v, daily_sentence_limit: e.target.value }))}
                          placeholder="default"
                          className="bg-card border border-border rounded px-1.5 py-0.5 text-xs w-20 focus:outline-none"
                        />
                      ) : (
                        <span className="text-xs font-mono text-foreground">
                          {u.daily_sentence_limit ?? <span className="text-muted-foreground">default</span>}
                        </span>
                      )}
                    </td>

                    {/* Expires */}
                    <td className="px-4 py-3">
                      {editing === u.id ? (
                        <input
                          type="date"
                          value={editValues.account_expires_at as string}
                          onChange={e => setEditValues(v => ({ ...v, account_expires_at: e.target.value }))}
                          className="bg-card border border-border rounded px-1.5 py-0.5 text-[10px] focus:outline-none"
                        />
                      ) : u.account_expires_at ? (
                        <span className={cn("inline-flex items-center gap-1 text-[10px]", expired ? "text-error" : "text-muted-foreground")}>
                          {expired && <AlertTriangle className="w-3 h-3" />}
                          <Clock className="w-3 h-3" />
                          {formatDate(u.account_expires_at)}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">{"\u2014"}</span>
                      )}
                    </td>

                    {/* Level / XP */}
                    <td className="px-4 py-3">
                      {editing === u.id ? (
                        <div className="flex gap-1">
                          <input type="number" value={editValues.level as number} onChange={e => setEditValues(v => ({ ...v, level: parseInt(e.target.value) || 1 }))} className="bg-card border border-border rounded px-1 py-0.5 text-xs w-12 focus:outline-none" />
                          <input type="number" value={editValues.xp as number} onChange={e => setEditValues(v => ({ ...v, xp: parseInt(e.target.value) || 0 }))} className="bg-card border border-border rounded px-1 py-0.5 text-xs w-16 focus:outline-none" />
                        </div>
                      ) : (
                        <>
                          <span className="font-mono text-foreground text-xs">Lv{u.level}</span>
                          <span className="text-[10px] text-muted-foreground ml-1">({u.xp} XP)</span>
                        </>
                      )}
                    </td>

                    {/* Analyses */}
                    <td className="px-4 py-3 font-mono text-foreground text-xs">{u.total_analyses}</td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {editing === u.id ? (
                        <button
                          onClick={() => setEditValues(v => ({ ...v, is_pro: !(v.is_pro as boolean) }))}
                          className={cn("text-[10px] px-2 py-0.5 rounded-full border", editValues.is_pro ? "bg-warning-light text-warning border-warning/30" : "bg-muted text-muted-foreground border-border")}
                        >
                          {editValues.is_pro ? "PRO" : "Free"}
                        </button>
                      ) : u.is_pro ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-warning-light text-warning border border-warning/20">
                          <Crown className="w-2.5 h-2.5" /> PRO
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">Free</span>
                      )}
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3 text-[10px] text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {editing === u.id ? (
                          <>
                            <button onClick={saveEdit} className="p-1 rounded hover:bg-success-light text-success"><Check className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setEditing(null)} className="p-1 rounded hover:bg-accent text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(u)} className="p-1 rounded hover:bg-accent text-muted-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                            {u.id !== ADMIN_USER_ID && (
                              deleting === u.id ? (
                                <div className="flex items-center gap-1 ml-1">
                                  <button onClick={() => confirmDelete(u.id)} className="text-[10px] px-2 py-0.5 rounded bg-red-600 text-white hover:bg-red-500">Confirm</button>
                                  <button onClick={() => setDeleting(null)} className="text-[10px] px-2 py-0.5 rounded bg-muted text-foreground hover:bg-accent">Cancel</button>
                                </div>
                              ) : (
                                <button onClick={() => setDeleting(u.id)} className="p-1 rounded hover:bg-error-light text-muted-foreground hover:text-error"><Trash2 className="w-3.5 h-3.5" /></button>
                              )
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={TABLE_HEADERS.length} className="px-4 py-12 text-center text-muted-foreground text-sm">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
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
