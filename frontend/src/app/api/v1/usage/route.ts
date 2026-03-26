/**
 * Usage API Route
 * 
 * Returns usage statistics for the current user.
 * Uses Supabase to track daily analyses count.
 */
import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedClient } from "@/lib/supabase/api"

// Rate limits
const FREE_LIMIT = 50
const PRO_LIMIT = 1000
const WINDOW_SECONDS = 86400  // 24 hours

export async function GET(request: NextRequest) {
  const { supabase, user } = await getAuthenticatedClient(request)
  
  if (!user) {
    // Anonymous user
    const now = Math.floor(Date.now() / 1000)
    return NextResponse.json({
      used_today: 0,
      limit: FREE_LIMIT,
      remaining: FREE_LIMIT,
      reset_at: now + WINDOW_SECONDS,
      is_pro: false,
    })
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  
  // Get user profile for pro status and custom limits
  const { data: profile } = await db
    .from("users")
    .select("is_pro, daily_sentence_limit, account_expires_at")
    .eq("id", user.id)
    .single()
  
  // Check account expiry
  if (profile?.account_expires_at) {
    const expiresAt = new Date(profile.account_expires_at)
    if (expiresAt < new Date()) {
      return NextResponse.json({
        used_today: 0,
        limit: 0,
        remaining: 0,
        reset_at: 0,
        is_pro: false,
        expired: true,
      })
    }
  }
  
  const isPro = profile?.is_pro ?? false
  const limit = profile?.daily_sentence_limit ?? (isPro ? PRO_LIMIT : FREE_LIMIT)
  
  // Count analyses from today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayIso = today.toISOString()
  
  const { count } = await db
    .from("analyses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", todayIso)
  
  const usedToday = count ?? 0
  const remaining = Math.max(0, limit - usedToday)
  
  // Calculate reset time (midnight UTC)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const resetAt = Math.floor(tomorrow.getTime() / 1000)
  
  return NextResponse.json({
    used_today: usedToday,
    limit,
    remaining,
    reset_at: resetAt,
    is_pro: isPro,
  })
}
