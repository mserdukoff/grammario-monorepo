import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedClient } from "@/lib/supabase/api"
import { getAdminClient } from "@/lib/supabase/admin-client"
import { ADMIN_USER_ID } from "@/lib/admin"

async function requireAdmin(request: NextRequest) {
  const { supabase, user } = await getAuthenticatedClient(request)
  if (!user || user.id !== ADMIN_USER_ID) {
    return null
  }
  return { supabase, user }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth) return NextResponse.json({ error: "forbidden" }, { status: 403 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = auth.supabase as any
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get("page") || "1")
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
  const offset = (page - 1) * limit
  const accountType = searchParams.get("account_type")

  let query = db
    .from("users")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })

  if (accountType && accountType !== "all") {
    query = query.eq("account_type", accountType)
  }

  const { data: users, error, count } = await query.range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ users: users || [], total: count || 0, page, limit })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth) return NextResponse.json({ error: "forbidden" }, { status: 403 })

  const serviceClient = getAdminClient()
  if (!serviceClient) {
    return NextResponse.json(
      { error: "Service role key not configured. Add SUPABASE_SERVICE_ROLE_KEY to create accounts." },
      { status: 501 }
    )
  }

  let body: {
    email: string
    password: string
    display_name?: string
    daily_sentence_limit?: number | null
    account_type?: string
    account_expires_at?: string | null
    admin_notes?: string | null
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!body.email || !body.password) {
    return NextResponse.json(
      { error: "email and password are required" },
      { status: 400 }
    )
  }

  if (body.password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    )
  }

  const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
    user_metadata: {
      full_name: body.display_name || body.email.split("@")[0],
    },
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  const userId = authData.user.id

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = auth.supabase as any
  const updates: Record<string, unknown> = {}
  if (body.display_name) updates.display_name = body.display_name
  if (body.account_type) updates.account_type = body.account_type
  if (body.daily_sentence_limit !== undefined) updates.daily_sentence_limit = body.daily_sentence_limit
  if (body.account_expires_at !== undefined) updates.account_expires_at = body.account_expires_at
  if (body.admin_notes !== undefined) updates.admin_notes = body.admin_notes

  if (Object.keys(updates).length > 0) {
    updates.updated_at = new Date().toISOString()
    const { error: updateError } = await db
      .from("users")
      .update(updates)
      .eq("id", userId)

    if (updateError) {
      return NextResponse.json(
        { error: `User created but profile update failed: ${updateError.message}` },
        { status: 207 }
      )
    }
  }

  const { data: profile } = await db
    .from("users")
    .select("*")
    .eq("id", userId)
    .single()

  return NextResponse.json({ user: profile }, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth) return NextResponse.json({ error: "forbidden" }, { status: 403 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = auth.supabase as any

  let body: { user_id: string; updates: Record<string, unknown> }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const allowed = [
    "display_name", "is_pro", "xp", "level", "streak", "longest_streak",
    "total_analyses", "account_type", "daily_sentence_limit",
    "account_expires_at", "admin_notes",
  ]
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
  const auth = await requireAdmin(request)
  if (!auth) return NextResponse.json({ error: "forbidden" }, { status: 403 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = auth.supabase as any

  const { user_id } = await request.json()
  if (!user_id || user_id === ADMIN_USER_ID) {
    return NextResponse.json({ error: "Cannot delete this user" }, { status: 400 })
  }

  const { error: dbError } = await db.from("users").delete().eq("id", user_id)
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  const serviceClient = getAdminClient()
  if (serviceClient) {
    const { error: authError } = await serviceClient.auth.admin.deleteUser(user_id)
    if (authError) {
      return NextResponse.json(
        { error: `DB row deleted but auth user removal failed: ${authError.message}` },
        { status: 207 }
      )
    }
  }

  return NextResponse.json({ deleted: true })
}
