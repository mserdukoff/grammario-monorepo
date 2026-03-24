"use client"

import { useState } from "react"
import { Star, Send, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { submitFeedback } from "@/lib/db"
import { cn } from "@/lib/utils"
import type { FeedbackCategory } from "@/lib/supabase/database.types"

const CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: "accuracy", label: "Analysis accuracy" },
  { value: "translation", label: "Translation quality" },
  { value: "grammar_tips", label: "Grammar tips" },
  { value: "difficulty", label: "Difficulty rating" },
  { value: "other", label: "Other" },
]

interface FeedbackFormProps {
  userId: string
  analysisId: string
  sentenceText: string
  language: string
  onClose: () => void
  onSubmitted?: () => void
}

export function FeedbackForm({
  userId,
  analysisId,
  sentenceText,
  language,
  onClose,
  onSubmitted,
}: FeedbackFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [category, setCategory] = useState<FeedbackCategory>("accuracy")
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    setSubmitting(true)
    try {
      await submitFeedback(userId, analysisId, rating, category, sentenceText, language, comment)
      toast.success("Feedback submitted — thank you!")
      onSubmitted?.()
      onClose()
    } catch (err) {
      console.error("Failed to submit feedback:", err)
      toast.error("Failed to submit feedback. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4 animate-fade-in-down">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Rate this analysis</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-muted-foreground italic truncate">
        &ldquo;{sentenceText}&rdquo;
      </p>

      {/* Star rating */}
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">Rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "w-5 h-5 transition-colors",
                  star <= (hoveredStar || rating)
                    ? "fill-warning text-warning"
                    : "text-muted-foreground/30"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">What is this about?</p>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-colors border",
                category === cat.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-surface-2 text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">Details (optional)</p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us more about what could be improved..."
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
      </div>

      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={submitting || rating === 0}
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
          ) : (
            <Send className="w-3.5 h-3.5 mr-1.5" />
          )}
          Submit feedback
        </Button>
      </div>
    </div>
  )
}
