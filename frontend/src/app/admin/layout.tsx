"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  Shield, LayoutDashboard, Users, Database, Server,
  BookOpen, ChevronLeft, LogOut, Sparkles,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { isAdmin } from "@/lib/admin"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/requests", label: "Requests & Data", icon: Database },
  { href: "/admin/vocabulary", label: "Vocabulary", icon: BookOpen },
  { href: "/admin/backend", label: "Backend", icon: Server },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (!loading && (!user || !isAdmin(user.id))) {
      router.replace("/")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="animate-pulse text-slate-500">Loading...</div>
      </div>
    )
  }

  if (!user || !isAdmin(user.id)) return null

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-slate-800 bg-slate-900/50 transition-all duration-200 shrink-0",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-4 h-14 border-b border-slate-800 shrink-0">
          <Shield className="w-5 h-5 text-red-400 shrink-0" />
          {!collapsed && <span className="font-bold text-sm text-red-400 truncate">Admin Console</span>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1 rounded hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className={cn("w-4 h-4 text-slate-500 transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800 p-2 space-y-1 shrink-0">
          <Link
            href="/app"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
            title={collapsed ? "Back to App" : undefined}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="truncate">Back to App</span>}
          </Link>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800/50 transition-colors w-full"
            title={collapsed ? "Sign Out" : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="truncate">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
