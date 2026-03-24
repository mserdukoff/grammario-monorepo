"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, Settings, Menu, X, Shield, FileText } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
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
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-14 max-w-screen-xl items-center">
          <Link href="/" className="mr-8 flex items-center gap-2.5">
            <span className="font-heading text-xl italic tracking-tight text-foreground">Grammario</span>
          </Link>

          <nav className="hidden md:flex flex-1 items-center gap-6 text-sm">
            <Link
              href="/#features"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="/#pricing"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
            {user && isAdmin(user.id) && (
              <>
                <Link
                  href="/patch-notes"
                  className={cn(
                    "transition-colors hover:text-foreground flex items-center gap-1",
                    pathname === "/patch-notes" ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Patch Notes
                </Link>
                <Link
                  href="/admin"
                  className={cn(
                    "transition-colors hover:text-foreground flex items-center gap-1",
                    pathname?.startsWith("/admin") ? "text-foreground" : "text-muted-foreground"
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
                <Link href="/app">
                  <Button size="sm">Open App</Button>
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center p-0.5 rounded-full hover:ring-2 hover:ring-border transition-all"
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
                        </div>
                        <div className="py-1">
                          <Link
                            href="/app"
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            Go to App
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
                              Admin
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
              <Link
                href="/#features"
                className="block px-4 py-2.5 rounded-lg hover:bg-accent transition-colors text-sm"
                onClick={() => setShowMobileMenu(false)}
              >
                Features
              </Link>
              <Link
                href="/#pricing"
                className="block px-4 py-2.5 rounded-lg hover:bg-accent transition-colors text-sm"
                onClick={() => setShowMobileMenu(false)}
              >
                Pricing
              </Link>
              {user ? (
                <Link
                  href="/app"
                  className="block px-4 py-2.5 rounded-lg hover:bg-accent transition-colors text-sm font-medium"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Go to App
                </Link>
              ) : (
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
