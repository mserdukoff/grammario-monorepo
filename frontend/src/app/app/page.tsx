"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Sparkles,
  Search,
  BookOpen,
  BarChart3,
  ArrowRight,
  Globe,
  Zap,
  Lock,
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
    <div className="flex min-h-screen flex-col bg-slate-950 text-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 z-[-2] h-screen w-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

      <AppNavbar />

      <main className="flex-1 relative z-10">
        {/* Hero */}
        <section className="relative pt-16 pb-20 md:pt-24 md:pb-32">
          <div className="container max-w-5xl text-center space-y-8">
            {user && profile && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-300">
                <Sparkles className="w-4 h-4" />
                Welcome back, {profile.display_name || "learner"}
              </div>
            )}

            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
              Your Grammar <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">
                Workspace
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
              Deconstruct sentences, build vocabulary, and track your progress across 5 languages — all in one place.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {LANGUAGES.map((lang) => (
                <span
                  key={lang.name}
                  className="px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-sm text-slate-300"
                >
                  {lang.flag} {lang.name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="pb-24">
          <div className="container max-w-5xl">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Analyze Card */}
              <div className="group relative rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-8 space-y-4 transition-all hover:border-indigo-500/40 hover:bg-slate-900/80">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Search className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold">Analyze</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Parse any sentence into its grammatical components with interactive dependency tree visualizations.
                </p>
                {user ? (
                  <Link href="/app/analyze">
                    <Button className="w-full mt-2 group-hover:bg-indigo-600 transition-colors">
                      Open Analyzer
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    className="w-full mt-2"
                    variant="outline"
                    onClick={() => setShowAuthModal(true)}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Sign in to Analyze
                  </Button>
                )}
              </div>

              {/* Review Card */}
              <div className="group relative rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-8 space-y-4 transition-all hover:border-emerald-500/40 hover:bg-slate-900/80">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold">Review</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Strengthen your vocabulary with spaced repetition flashcards powered by the SM-2 algorithm.
                </p>
                {user ? (
                  <Link href="/app/review">
                    <Button className="w-full mt-2 group-hover:bg-emerald-600 transition-colors" variant="outline">
                      Start Review
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    className="w-full mt-2"
                    variant="outline"
                    onClick={() => setShowAuthModal(true)}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Sign in to Review
                  </Button>
                )}
              </div>

              {/* Progress Card */}
              <div className="group relative rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-8 space-y-4 transition-all hover:border-amber-500/40 hover:bg-slate-900/80">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold">Progress</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Track your learning with XP, streaks, daily goals, and level progression to stay motivated.
                </p>
                {user && profile ? (
                  <div className="mt-2 space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 rounded-lg bg-slate-800/50">
                        <p className="text-lg font-bold">{profile.level}</p>
                        <p className="text-[10px] text-slate-500">Level</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-slate-800/50">
                        <p className="text-lg font-bold">{profile.streak}</p>
                        <p className="text-[10px] text-slate-500">Streak</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-slate-800/50">
                        <p className="text-lg font-bold">{profile.total_analyses}</p>
                        <p className="text-[10px] text-slate-500">Analyzed</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button
                    className="w-full mt-2"
                    variant="outline"
                    onClick={() => setShowAuthModal(true)}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Sign in to Track
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Quick Info */}
        <section className="pb-24">
          <div className="container max-w-5xl">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-indigo-500/10 shrink-0">
                  <Zap className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Deterministic Parsing</h4>
                  <p className="text-sm text-slate-400">Powered by Stanza NLP — no hallucinations, just accurate grammar analysis.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-emerald-500/10 shrink-0">
                  <Globe className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">5 Languages</h4>
                  <p className="text-sm text-slate-400">Italian, Spanish, German, Russian, and Turkish — with more on the way.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-amber-500/10 shrink-0">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">AI Teacher&apos;s Notes</h4>
                  <p className="text-sm text-slate-400">Get translations, grammar explanations, and &ldquo;why&rdquo; answers from an AI tutor.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode="signup"
      />
    </div>
  )
}
