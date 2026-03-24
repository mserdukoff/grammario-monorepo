"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, Settings, Menu, X, BookOpen, Shield, FileText, Search } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { isAdmin } from "@/lib/admin"
import { Button } from "./button"
import { AuthModal } from "@/components/auth/auth-modal"
import { cn } from "@/lib/utils"

export function AppNavbar() {
  const pathname = usePathname()
  const { user, profile, loading, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const openLogin = () => {
    setAuthMode("login")
    setShowAuthModal(true)
  }

  const openSignup = () => {
    setAuthMode("signup")
    setShowAuthModal(true)
  }

  const handleSignOut = async () => {
    await signOut()
    setShowUserMenu(false)
  }

  const navItems = [
    { href: "/app", label: "Home", show: true },
    { href: "/app/analyze", label: "Analyze", icon: Search, show: !!user },
    { href: "/app/review", label: "Review", icon: BookOpen, show: !!user },
  ]

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-14 max-w-screen-xl items-center">
          <Link href="/app" className="mr-8 flex items-center gap-2.5">
            <span className="font-heading text-xl italic tracking-tight text-foreground">Grammario</span>
          </Link>

          <nav className="hidden md:flex flex-1 items-center gap-1 text-sm">
            {navItems.filter(n => n.show).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5",
                  pathname === item.href
                    ? "bg-accent text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {item.icon && <item.icon className="w-3.5 h-3.5" />}
                {item.label}
              </Link>
            ))}
            {user && isAdmin(user.id) && (
              <>
                <div className="w-px h-4 bg-border mx-1" />
                <Link
                  href="/patch-notes"
                  className={cn(
                    "px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 text-sm",
                    pathname === "/patch-notes"
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Notes
                </Link>
                <Link
                  href="/admin"
                  className={cn(
                    "px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 text-sm",
                    pathname?.startsWith("/admin")
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-3 ml-auto">
            {loading ? (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            ) : user && profile ? (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-border transition-all"
                  >
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.display_name || "User"}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-foreground">
                          {profile.display_name?.[0]?.toUpperCase() || profile.email[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </button>

                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-52 rounded-lg border border-border bg-popover shadow-lg z-50 py-1">
                        <div className="px-4 py-3 border-b border-border">
                          <p className="text-sm font-medium">{profile.display_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                          {profile.level > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">Level {profile.level} &middot; {profile.xp} XP</p>
                          )}
                        </div>
                        <div className="py-1">
                          <Link
                            href="/app"
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            App Home
                          </Link>
                          <Link
                            href="/app/analyze"
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Search className="w-4 h-4" />
                            Analyze
                          </Link>
                          <Link
                            href="/app/settings"
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Settings className="w-4 h-4" />
                            Settings
                          </Link>
                          {isAdmin(user?.id) && (
                            <Link
                              href="/admin"
                              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <Shield className="w-4 h-4" />
                              Admin Console
                            </Link>
                          )}
                        </div>
                        <div className="border-t border-border py-1">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-accent transition-colors w-full"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={openLogin}>
                  Sign in
                </Button>
                <Button size="sm" onClick={openSignup}>
                  Get Started
                </Button>
              </div>
            )}

            <button
              className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {showMobileMenu && (
          <div className="md:hidden border-t border-border bg-background">
            <nav className="container py-4 space-y-1">
              {navItems.filter(n => n.show).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors text-sm",
                    pathname === item.href ? "bg-accent font-medium" : "hover:bg-accent"
                  )}
                  onClick={() => setShowMobileMenu(false)}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  {item.label}
                </Link>
              ))}
              {user && (
                <Link
                  href="/app/settings"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-accent transition-colors text-sm"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              )}
              {!user && (
                <div className="pt-3 space-y-2 px-4">
                  <Button variant="outline" className="w-full" onClick={openLogin}>
                    Sign in
                  </Button>
                  <Button className="w-full" onClick={openSignup}>
                    Get Started
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authMode}
      />
    </>
  )
}
