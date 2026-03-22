"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  ArrowLeft,
  RotateCcw,
  Check,
  X,
  Brain,
  Zap,
  Target,
  Loader2,
  ChevronRight,
  Eye,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/ui/navbar"
import { useAuth } from "@/lib/auth-context"
import { qualityLabel, qualityColor } from "@/lib/sm2"
import { cn } from "@/lib/utils"

interface VocabWord {
  id: string
  word: string
  lemma: string
  translation: string | null
  language: string
  part_of_speech: string | null
  context: string | null
  mastery: number
  ease_factor: number
  interval_days: number
  review_count: number
}

interface ReviewStats {
  total: number
  due: number
  mastered: number
}

const FLAG_MAP: Record<string, string> = {
  it: "🇮🇹",
  es: "🇪🇸",
  de: "🇩🇪",
  ru: "🇷🇺",
  tr: "🇹🇷",
}

export default function ReviewPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [words, setWords] = useState<VocabWord[]>([])
  const [stats, setStats] = useState<ReviewStats>({ total: 0, due: 0, mastered: 0 })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [sessionResults, setSessionResults] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 })

  const fetchReviewWords = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch("/api/v1/vocabulary/review")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setWords(data.words || [])
      setStats(data.stats || { total: 0, due: 0, mastered: 0 })
      if (!data.words?.length) {
        setSessionComplete(true)
      }
    } catch (err) {
      console.error("Failed to fetch review words:", err)
      toast.error("Failed to load review words")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchReviewWords()
  }, [fetchReviewWords])

  const currentWord = words[currentIndex]

  const handleRate = async (quality: number) => {
    if (!currentWord || submitting) return
    setSubmitting(true)

    try {
      const res = await fetch("/api/v1/vocabulary/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vocab_id: currentWord.id, quality }),
      })

      if (!res.ok) throw new Error("Failed to submit review")

      setSessionResults((prev) => ({
        correct: quality >= 3 ? prev.correct + 1 : prev.correct,
        total: prev.total + 1,
      }))

      if (currentIndex + 1 < words.length) {
        setCurrentIndex((i) => i + 1)
        setRevealed(false)
      } else {
        setSessionComplete(true)
      }
    } catch (err) {
      console.error("Review submission failed:", err)
      toast.error("Failed to save review")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRestart = () => {
    setSessionComplete(false)
    setSessionResults({ correct: 0, total: 0 })
    setCurrentIndex(0)
    setRevealed(false)
    fetchReviewWords()
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-950 text-foreground">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <BookOpen className="w-12 h-12 text-slate-500 mx-auto" />
            <p className="text-slate-400">Sign in to access vocabulary review</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none opacity-20" />
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-start pt-8 px-4 relative z-10">
        {/* Header */}
        <div className="w-full max-w-2xl mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push("/app")}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Dashboard</span>
            </button>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-500" />
              Vocabulary Review
            </h1>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="rounded-lg border border-border bg-slate-900/50 p-3 text-center">
              <p className="text-xs text-slate-400 mb-1">Total Words</p>
              <p className="text-lg font-bold">{stats.total}</p>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 text-center">
              <p className="text-xs text-amber-400 mb-1">Due Today</p>
              <p className="text-lg font-bold text-amber-300">{stats.due}</p>
            </div>
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3 text-center">
              <p className="text-xs text-emerald-400 mb-1">Mastered</p>
              <p className="text-lg font-bold text-emerald-300">{stats.mastered}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading review words...</span>
          </div>
        ) : sessionComplete ? (
          /* Session Complete Screen */
          <div className="w-full max-w-md text-center space-y-6">
            <div className="rounded-2xl border border-border bg-slate-900/80 backdrop-blur p-8 space-y-4">
              {sessionResults.total > 0 ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-bold">Session Complete!</h2>
                  <p className="text-slate-400">
                    You reviewed {sessionResults.total} word{sessionResults.total !== 1 ? "s" : ""} and got{" "}
                    <span className="text-emerald-400 font-semibold">{sessionResults.correct}</span> correct.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                    <Target className="w-4 h-4" />
                    <span>
                      Accuracy: {Math.round((sessionResults.correct / sessionResults.total) * 100)}%
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-indigo-500/20 border-2 border-indigo-500/40 flex items-center justify-center mx-auto">
                    <Zap className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h2 className="text-xl font-bold">All Caught Up!</h2>
                  <p className="text-slate-400">
                    No words due for review right now. Analyze more sentences to build your vocabulary.
                  </p>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleRestart}
                  variant="outline"
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Review Again
                </Button>
                <Button
                  onClick={() => router.push("/app")}
                  className="flex-1"
                >
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Analyze More
                </Button>
              </div>
            </div>
          </div>
        ) : currentWord ? (
          /* Flashcard */
          <div className="w-full max-w-md space-y-4">
            {/* Progress */}
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
              <span>{currentIndex + 1} / {words.length}</span>
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Card */}
            <div className="rounded-2xl border-2 border-border bg-slate-900/80 backdrop-blur overflow-hidden">
              {/* Front */}
              <div className="p-8 text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                  <span>{FLAG_MAP[currentWord.language] || ""}</span>
                  <span className="uppercase">{currentWord.part_of_speech || "word"}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    Mastery: {currentWord.mastery}%
                  </span>
                </div>

                <h2 className="text-3xl font-bold">{currentWord.word}</h2>
                <p className="text-sm text-slate-400 italic">{currentWord.lemma}</p>

                {currentWord.context && (
                  <div className="mt-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">CONTEXT</p>
                    <p className="text-sm text-slate-300 italic">&ldquo;{currentWord.context}&rdquo;</p>
                  </div>
                )}
              </div>

              {/* Reveal Button / Answer */}
              {!revealed ? (
                <div className="px-8 pb-8">
                  <Button
                    onClick={() => setRevealed(true)}
                    className="w-full"
                    size="lg"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Show Answer
                  </Button>
                </div>
              ) : (
                <div className="border-t border-border p-6 space-y-4 bg-slate-800/30">
                  {currentWord.translation && (
                    <p className="text-center text-lg font-medium text-emerald-300">
                      {currentWord.translation}
                    </p>
                  )}

                  <p className="text-xs text-center text-slate-500">How well did you know this?</p>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { q: 1, icon: X, label: "Wrong" },
                      { q: 3, icon: Check, label: "Hard" },
                      { q: 4, icon: Check, label: "Good" },
                    ].map(({ q, icon: Icon, label }) => (
                      <button
                        key={q}
                        onClick={() => handleRate(q)}
                        disabled={submitting}
                        className={cn(
                          "flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors",
                          q === 1
                            ? "border-red-500/30 bg-red-950/20 hover:bg-red-950/40 text-red-400"
                            : q === 3
                            ? "border-yellow-500/30 bg-yellow-950/20 hover:bg-yellow-950/40 text-yellow-400"
                            : "border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-400",
                          submitting && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-center gap-1 pt-2">
                    {[0, 1, 2, 3, 4, 5].map((q) => (
                      <button
                        key={q}
                        onClick={() => handleRate(q)}
                        disabled={submitting}
                        className={cn(
                          "px-2 py-1 text-xs rounded transition-colors hover:bg-slate-700",
                          qualityColor(q),
                          submitting && "opacity-50"
                        )}
                        title={qualityLabel(q)}
                      >
                        {q}
                      </button>
                    ))}
                    <span className="text-xs text-slate-600 ml-2 self-center">advanced</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}
