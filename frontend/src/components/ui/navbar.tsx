"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sparkles, User, LogOut, Settings, Crown, Flame, Menu, X, BookOpen, Shield } from "lucide-react"
import { useAuth, xpProgress, xpForNextLevel } from "@/lib/auth-context"
import { isAdmin } from "@/lib/admin"
import { Button } from "./button"
import { AuthModal } from "@/components/auth/auth-modal"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()
  const { user, profile, loading, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const isAppPage = pathname?.startsWith("/app")

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

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          {/* Logo */}
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-indigo-500" />
            <span className="hidden font-bold sm:inline-block">Grammario</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-1 items-center space-x-6 text-sm font-medium">
            <Link
              href="/#features"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Features
            </Link>
            <Link
              href="/#pricing"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Pricing
            </Link>
            {user && (
              <>
                <Link
                  href="/app"
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    pathname === "/app" ? "text-foreground" : "text-foreground/60"
                  )}
                >
                  Dashboard
                </Link>
                <Link
                  href="/app/review"
                  className={cn(
                    "transition-colors hover:text-foreground/80 flex items-center gap-1",
                    pathname === "/app/review" ? "text-foreground" : "text-foreground/60"
                  )}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Review
                </Link>
                {isAdmin(user.id) && (
                  <Link
                    href="/admin"
                    className={cn(
                      "transition-colors hover:text-foreground/80 flex items-center gap-1",
                      pathname?.startsWith("/admin") ? "text-red-400" : "text-red-400/60"
                    )}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Admin
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="h-8 w-8 rounded-full bg-slate-800 animate-pulse" />
            ) : user && profile ? (
              <div className="flex items-center gap-3">
                {/* Streak indicator */}
                {profile.streak > 0 && (
                  <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-xs font-medium text-orange-400">{profile.streak}</span>
                  </div>
                )}

                {/* XP / Level */}
                <div className="hidden sm:flex items-center gap-2">
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-muted-foreground">Level {profile.level}</span>
                    <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${xpProgress(profile.xp, profile.level)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Pro badge */}
                {profile.is_pro && (
                  <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                    <Crown className="w-3 h-3 text-amber-500" />
                    <span className="text-xs font-medium text-amber-400">PRO</span>
                  </div>
                )}

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-800 transition-colors"
                  >
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.display_name || "User"}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {profile.display_name?.[0]?.toUpperCase() || profile.email[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </button>

                  {/* Dropdown menu */}
                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-slate-800 bg-slate-900 shadow-xl z-50 py-1">
                        <div className="px-4 py-3 border-b border-slate-800">
                          <p className="text-sm font-medium">{profile.display_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                        </div>

                        <div className="py-1">
                          <Link
                            href="/app"
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-800 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <User className="w-4 h-4" />
                            Dashboard
                          </Link>
                          <Link
                            href="/app/settings"
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-800 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Settings className="w-4 h-4" />
                            Settings
                          </Link>
                          {isAdmin(user?.id) && (
                            <Link
                              href="/admin"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-800 transition-colors"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <Shield className="w-4 h-4" />
                              Admin Console
                            </Link>
                          )}
                        </div>

                        <div className="border-t border-slate-800 py-1">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-800 transition-colors w-full"
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

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur">
            <nav className="container py-4 space-y-2">
              <Link
                href="/#features"
                className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                Features
              </Link>
              <Link
                href="/#pricing"
                className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                Pricing
              </Link>
              {user ? (
                <>
                  <Link
                    href="/app"
                    className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Dashboard
                  </Link>
                  {isAdmin(user.id) && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors text-red-400"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <Shield className="w-4 h-4" />
                      Admin
                    </Link>
                  )}
                </>
              ) : (
                <div className="pt-2 space-y-2">
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
