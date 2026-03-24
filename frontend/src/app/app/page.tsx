"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Search,
  BookOpen,
  ArrowRight,
  Lock,
  Flame,
  Target,
  TrendingUp,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { AppNavbar } from "@/components/ui/app-navbar"
import { AuthModal } from "@/components/auth/auth-modal"
import { useAuth } from "@/lib/auth-context"

const LANGUAGES = [
  { flag: "🇮🇹", name: "Italian" },
  { flag: "🇪🇸", name: "Spanish" },
  { flag: "🇩🇪", name: "German" },
  { flag: "🇷🇺", name: "Russian" },
  { flag: "🇹🇷", name: "Turkish" },
]

export default function AppHome() {
  const { user, profile } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <AppNavbar />

      <main className="flex-1">
        <div className="container max-w-screen-xl py-10 md:py-16">
          {/* Welcome */}
          <div className="mb-12">
            {user && profile ? (
              <>
                <h1 className="font-heading text-3xl md:text-4xl italic tracking-tight mb-2">
                  Welcome back, {profile.display_name || "learner"}
                </h1>
                <p className="text-muted-foreground">
                  Continue your learning across {LANGUAGES.map(l => l.flag).join(" ")}
                </p>
              </>
            ) : (
              <>
                <h1 className="font-heading text-3xl md:text-4xl italic tracking-tight mb-2">
                  Your grammar workspace
                </h1>
                <p className="text-muted-foreground">
                  Deconstruct sentences, build vocabulary, and track your progress across 5 languages.
                </p>
              </>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Analyze - primary action */}
              <div className="rounded-lg border border-border bg-card p-6 md:p-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Analyze a sentence</h2>
                    <p className="text-sm text-muted-foreground">
                      Parse any sentence into its grammatical components with interactive dependency visualizations.
                    </p>
                  </div>
                  <Search className="w-5 h-5 text-primary shrink-0 mt-1" />
                </div>
                {user ? (
                  <Link href="/app/analyze">
                    <Button className="mt-2">
                      Open Analyzer
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => setShowAuthModal(true)}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Sign in to analyze
                  </Button>
                )}
              </div>

              {/* Review */}
              <div className="rounded-lg border border-border bg-card p-6 md:p-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Vocabulary review</h2>
                    <p className="text-sm text-muted-foreground">
                      Strengthen your vocabulary with spaced repetition flashcards powered by the SM-2 algorithm.
                    </p>
                  </div>
                  <BookOpen className="w-5 h-5 text-primary shrink-0 mt-1" />
                </div>
                {user ? (
                  <Link href="/app/review">
                    <Button variant="outline" className="mt-2">
                      Start review
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => setShowAuthModal(true)}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Sign in to review
                  </Button>
                )}
              </div>
            </div>

            {/* Sidebar: Progress */}
            <div className="space-y-6">
              {user && profile ? (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Your progress</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-surface-2">
                            <TrendingUp className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Level {profile.level}</p>
                            <p className="text-xs text-muted-foreground">{profile.xp} XP total</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-surface-2">
                            <Flame className="w-4 h-4 text-warning" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{profile.streak} day streak</p>
                            <p className="text-xs text-muted-foreground">Best: {profile.longest_streak} days</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-surface-2">
                            <Target className="w-4 h-4 text-success" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{profile.total_analyses} analyses</p>
                            <p className="text-xs text-muted-foreground">Total sentences analyzed</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {LANGUAGES.map((lang) => (
                        <span
                          key={lang.name}
                          className="px-3 py-1.5 rounded-md bg-surface-2 text-sm"
                        >
                          {lang.flag} {lang.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="font-medium mb-2">Track your progress</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sign in to track XP, streaks, daily goals, and level progression.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowAuthModal(true)}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Sign in
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode="signup"
      />
    </div>
  )
}
