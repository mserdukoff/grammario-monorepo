/**
 * SuperMemo SM-2 Spaced Repetition Algorithm
 *
 * Determines when to show a flashcard next based on how well the user recalled it.
 *
 * Quality ratings:
 *   0 - Complete blackout
 *   1 - Wrong, but recognized on reveal
 *   2 - Wrong, but felt close
 *   3 - Correct with serious difficulty
 *   4 - Correct with slight hesitation
 *   5 - Perfect recall
 */

export interface SM2Input {
  quality: number       // 0-5 rating of recall quality
  easeFactor: number    // Current ease factor (>= 1.3)
  interval: number      // Current interval in days
  repetitions: number   // Number of consecutive correct reviews
}

export interface SM2Result {
  easeFactor: number
  interval: number
  repetitions: number
  nextReview: Date
  mastery: number       // 0-100 mastery percentage
}

export function sm2(input: SM2Input): SM2Result {
  const { quality } = input
  let { easeFactor, interval, repetitions } = input

  if (quality < 0 || quality > 5) {
    throw new Error("Quality must be between 0 and 5")
  }

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }
    repetitions += 1
  } else {
    // Incorrect response: reset
    repetitions = 0
    interval = 1
  }

  // Update ease factor using SM-2 formula
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  easeFactor = Math.max(1.3, easeFactor)

  // Calculate next review date
  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)

  // Calculate mastery as a percentage (0-100)
  // Based on repetitions, ease factor, and interval
  const mastery = calculateMastery(repetitions, easeFactor, interval)

  return {
    easeFactor: Math.round(easeFactor * 100) / 100,
    interval,
    repetitions,
    nextReview,
    mastery,
  }
}

function calculateMastery(repetitions: number, easeFactor: number, interval: number): number {
  // Mastery increases with repetitions and interval length
  // Caps at 100, starts at 0
  const repScore = Math.min(repetitions / 8, 1) * 40           // 40% from repetition count
  const intervalScore = Math.min(interval / 60, 1) * 30        // 30% from interval length
  const easeScore = Math.min((easeFactor - 1.3) / 1.7, 1) * 30 // 30% from ease factor

  return Math.min(100, Math.round(repScore + intervalScore + easeScore))
}

/**
 * Determine the quality rating label for display purposes.
 */
export function qualityLabel(quality: number): string {
  switch (quality) {
    case 0: return "Blackout"
    case 1: return "Wrong"
    case 2: return "Almost"
    case 3: return "Hard"
    case 4: return "Good"
    case 5: return "Easy"
    default: return "Unknown"
  }
}

/**
 * Get color for quality rating display.
 */
export function qualityColor(quality: number): string {
  switch (quality) {
    case 0: return "text-red-500"
    case 1: return "text-red-400"
    case 2: return "text-orange-400"
    case 3: return "text-yellow-400"
    case 4: return "text-emerald-400"
    case 5: return "text-emerald-500"
    default: return "text-slate-400"
  }
}
