/**
 * Vocabulary Review API Routes
 *
 * GET  - Fetch words due for review today
 * POST - Submit a review result and update SM-2 fields
 */
import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedClient } from "@/lib/supabase/api"
import { sm2 } from "@/lib/sm2"

export async function GET(request: NextRequest) {
  const { supabase, user } = await getAuthenticatedClient(request)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const today = new Date().toISOString().split("T")[0]

  const { data: dueWords, error } = await db
    .from("vocabulary")
    .select("*")
    .eq("user_id", user.id)
    .lte("next_review", today)
    .order("next_review", { ascending: true })
    .limit(20)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Also get total stats
  const { count: totalWords } = await db
    .from("vocabulary")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  const { count: masteredWords } = await db
    .from("vocabulary")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("mastery", 80)

  const { count: dueCount } = await db
    .from("vocabulary")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .lte("next_review", today)

  return NextResponse.json({
    words: dueWords || [],
    stats: {
      total: totalWords || 0,
      due: dueCount || 0,
      mastered: masteredWords || 0,
    },
  })
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await getAuthenticatedClient(request)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  let body: { vocab_id?: string; quality?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { vocab_id, quality } = body
  if (!vocab_id || quality === undefined || quality < 0 || quality > 5) {
    return NextResponse.json(
      { error: "vocab_id and quality (0-5) are required" },
      { status: 400 }
    )
  }

  // Fetch current vocabulary item
  const { data: vocab, error: fetchError } = await db
    .from("vocabulary")
    .select("*")
    .eq("id", vocab_id)
    .eq("user_id", user.id)
    .single()

  if (fetchError || !vocab) {
    return NextResponse.json({ error: "Vocabulary item not found" }, { status: 404 })
  }

  // Apply SM-2 algorithm
  const result = sm2({
    quality,
    easeFactor: vocab.ease_factor || 2.5,
    interval: vocab.interval_days || 1,
    repetitions: vocab.review_count || 0,
  })

  // Update the vocabulary record
  const { error: updateError } = await db
    .from("vocabulary")
    .update({
      ease_factor: result.easeFactor,
      interval_days: result.interval,
      next_review: result.nextReview.toISOString().split("T")[0],
      last_reviewed: new Date().toISOString(),
      review_count: result.repetitions,
      mastery: result.mastery,
    })
    .eq("id", vocab_id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    result: {
      new_interval: result.interval,
      new_ease_factor: result.easeFactor,
      next_review: result.nextReview.toISOString().split("T")[0],
      mastery: result.mastery,
    },
  })
}
