"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  ArrowLeft,
  RotateCcw,
  Check,
  X,
  Loader2,
  ChevronRight,
  Eye,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { AppNavbar } from "@/components/ui/app-navbar"
import { useAuth } from "@/lib/auth-context"
import { qualityLabel, qualityColor } from "@/lib/sm2"
import { cn } from "@/lib/utils"
import { authFetch } from "@/lib/auth-fetch"

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
      const res = await authFetch("/api/v1/vocabulary/review")
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
      const res = await authFetch("/api/v1/vocabulary/review", {
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
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <AppNavbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Sign in to access vocabulary review</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <AppNavbar />

      <main className="flex-1 flex flex-col items-center justify-start pt-8 px-4">
        <div className="w-full max-w-lg mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push("/app")}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="font-heading text-xl italic">Vocabulary Review</h1>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
            <span>{stats.total} words</span>
            <span className="text-warning font-medium">{stats.due} due</span>
            <span className="text-success font-medium">{stats.mastered} mastered</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading review words...</span>
          </div>
        ) : sessionComplete ? (
          <div className="w-full max-w-md text-center space-y-6">
            <div className="rounded-lg border border-border bg-card p-8 space-y-4">
              {sessionResults.total > 0 ? (
                <>
                  <div className="w-14 h-14 rounded-full bg-success-light flex items-center justify-center mx-auto">
                    <Check className="w-7 h-7 text-success" />
                  </div>
                  <h2 className="text-xl font-semibold">Session complete</h2>
                  <p className="text-muted-foreground text-sm">
                    You reviewed {sessionResults.total} word{sessionResults.total !== 1 ? "s" : ""} and got{" "}
                    <span className="text-success font-medium">{sessionResults.correct}</span> correct.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Accuracy: {Math.round((sessionResults.correct / sessionResults.total) * 100)}%
                  </p>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Check className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold">All caught up</h2>
                  <p className="text-muted-foreground text-sm">
                    No words due for review. Analyze more sentences to build your vocabulary.
                  </p>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleRestart}
                  variant="outline"
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Again
                </Button>
                <Button
                  onClick={() => router.push("/app/analyze")}
                  className="flex-1"
                >
                  Analyze more
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        ) : currentWord ? (
          <div className="w-full max-w-md space-y-4">
            {/* Progress */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{currentIndex + 1} / {words.length}</span>
              <div className="flex-1 h-1 bg-surface-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Flashcard */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="p-8 text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <span>{FLAG_MAP[currentWord.language] || ""}</span>
                  <span className="uppercase">{currentWord.part_of_speech || "word"}</span>
                  <span className="text-muted-foreground">&middot;</span>
                  <span>{currentWord.mastery}% mastered</span>
                </div>

                <h2 className="font-heading text-3xl italic">{currentWord.word}</h2>
                <p className="text-sm text-muted-foreground italic">{currentWord.lemma}</p>

                {currentWord.context && (
                  <div className="mt-4 p-3 rounded-md bg-surface-2 text-left">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-medium">Context</p>
                    <p className="text-sm italic">&ldquo;{currentWord.context}&rdquo;</p>
                  </div>
                )}
              </div>

              {!revealed ? (
                <div className="px-8 pb-8">
                  <Button
                    onClick={() => setRevealed(true)}
                    className="w-full"
                    size="lg"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Show answer
                  </Button>
                </div>
              ) : (
                <div className="border-t border-border p-6 space-y-4">
                  {currentWord.translation && (
                    <p className="text-center text-lg font-medium text-primary">
                      {currentWord.translation}
                    </p>
                  )}

                  <p className="text-xs text-center text-muted-foreground">How well did you know this?</p>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { q: 1, icon: X, label: "Wrong", style: "border-error/30 text-error hover:bg-error-light" },
                      { q: 3, icon: Check, label: "Hard", style: "border-warning/30 text-warning hover:bg-warning-light" },
                      { q: 4, icon: Check, label: "Good", style: "border-success/30 text-success hover:bg-success-light" },
                    ].map(({ q, icon: Icon, label, style }) => (
                      <button
                        key={q}
                        onClick={() => handleRate(q)}
                        disabled={submitting}
                        className={cn(
                          "flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors",
                          style,
                          submitting && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{label}</span>
                      </button>
                    ))}
                  </div>

                  <details className="pt-1">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors text-center">
                      Advanced rating (0-5)
                    </summary>
                    <div className="flex justify-center gap-1 pt-2">
                      {[0, 1, 2, 3, 4, 5].map((q) => (
                        <button
                          key={q}
                          onClick={() => handleRate(q)}
                          disabled={submitting}
                          className={cn(
                            "px-2.5 py-1 text-xs rounded-md transition-colors hover:bg-accent border border-transparent hover:border-border",
                            qualityColor(q),
                            submitting && "opacity-50"
                          )}
                          title={qualityLabel(q)}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}
