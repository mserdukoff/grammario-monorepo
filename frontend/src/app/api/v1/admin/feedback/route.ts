import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedClient } from "@/lib/supabase/api"
import { getAdminClient } from "@/lib/supabase/admin-client"
import { ADMIN_USER_ID } from "@/lib/admin"

export async function GET(request: NextRequest) {
  const { user } = await getAuthenticatedClient(request)
  if (!user || user.id !== ADMIN_USER_ID) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const db = getAdminClient()

  const url = new URL(request.url)
  const category = url.searchParams.get("category")
  const resolved = url.searchParams.get("resolved")
  const limit = parseInt(url.searchParams.get("limit") || "50")
  const offset = parseInt(url.searchParams.get("offset") || "0")

  let query = db
    .from("sentence_feedback")
    .select("*, users!sentence_feedback_user_id_fkey(email, display_name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (category && category !== "all") {
    query = query.eq("category", category)
  }
  if (resolved === "true") {
    query = query.eq("is_resolved", true)
  } else if (resolved === "false") {
    query = query.eq("is_resolved", false)
  }

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Summary stats
  const [totalRes, unresolvedRes, avgRatingRes] = await Promise.all([
    db.from("sentence_feedback").select("*", { count: "exact", head: true }),
    db.from("sentence_feedback").select("*", { count: "exact", head: true }).eq("is_resolved", false),
    db.from("sentence_feedback").select("rating"),
  ])

  const ratings = (avgRatingRes.data || []).map((r: { rating: number }) => r.rating)
  const avgRating = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0

  // Category breakdown
  const catCounts: Record<string, number> = {}
  for (const item of (data || [])) {
    catCounts[item.category] = (catCounts[item.category] || 0) + 1
  }

  return NextResponse.json({
    feedback: data || [],
    total: count || 0,
    summary: {
      total: totalRes.count || 0,
      unresolved: unresolvedRes.count || 0,
      avg_rating: Math.round(avgRating * 10) / 10,
    },
  })
}

export async function PATCH(request: NextRequest) {
  const { user } = await getAuthenticatedClient(request)
  if (!user || user.id !== ADMIN_USER_ID) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const db = getAdminClient()

  const body = await request.json()
  const { id, is_resolved, admin_notes } = body

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (typeof is_resolved === "boolean") updates.is_resolved = is_resolved
  if (typeof admin_notes === "string") updates.admin_notes = admin_notes

  const { error } = await db
    .from("sentence_feedback")
    .update(updates)
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
