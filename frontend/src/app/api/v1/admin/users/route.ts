import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedClient } from "@/lib/supabase/api"
import { ADMIN_USER_ID } from "@/lib/admin"

export async function GET(request: NextRequest) {
  const { supabase, user } = await getAuthenticatedClient(request)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  if (!user || user.id !== ADMIN_USER_ID) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get("page") || "1")
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
  const offset = (page - 1) * limit

  const { data: users, error, count } = await db
    .from("users")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ users: users || [], total: count || 0, page, limit })
}

export async function PATCH(request: NextRequest) {
  const { supabase, user } = await getAuthenticatedClient(request)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  if (!user || user.id !== ADMIN_USER_ID) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  let body: { user_id: string; updates: Record<string, unknown> }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const allowed = ["display_name", "is_pro", "xp", "level", "streak", "longest_streak", "total_analyses"]
  const filtered: Record<string, unknown> = {}
  for (const key of allowed) {
    if (body.updates[key] !== undefined) filtered[key] = body.updates[key]
  }

  if (Object.keys(filtered).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
  }

  filtered.updated_at = new Date().toISOString()

  const { data, error } = await db
    .from("users")
    .update(filtered)
    .eq("id", body.user_id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ user: data })
}

export async function DELETE(request: NextRequest) {
  const { supabase, user } = await getAuthenticatedClient(request)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  if (!user || user.id !== ADMIN_USER_ID) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const { user_id } = await request.json()
  if (!user_id || user_id === ADMIN_USER_ID) {
    return NextResponse.json({ error: "Cannot delete this user" }, { status: 400 })
  }

  const { error } = await db.from("users").delete().eq("id", user_id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ deleted: true })
}
