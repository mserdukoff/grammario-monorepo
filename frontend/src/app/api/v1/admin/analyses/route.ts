import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ADMIN_USER_ID } from "@/lib/admin"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== ADMIN_USER_ID) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get("page") || "1")
  const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 100)
  const language = searchParams.get("language")
  const userId = searchParams.get("user_id")
  const id = searchParams.get("id")
  const offset = (page - 1) * limit

  // Single analysis by ID (full raw data)
  if (id) {
    const { data, error } = await db
      .from("analyses")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get the user info too
    let ownerInfo = null
    if (data?.user_id) {
      const { data: owner } = await db
        .from("users")
        .select("id, email, display_name")
        .eq("id", data.user_id)
        .single()
      ownerInfo = owner
    }

    return NextResponse.json({ analysis: data, owner: ownerInfo })
  }

  // Paginated list
  let query = db
    .from("analyses")
    .select("id, user_id, text, language, translation, is_favorite, created_at, nodes, pedagogical_data", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (language) query = query.eq("language", language)
  if (userId) query = query.eq("user_id", userId)

  const { data: analyses, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Batch-fetch user info for the user_ids in this page
  const userIds = [...new Set((analyses || []).map((a: { user_id: string }) => a.user_id))]
  let usersMap: Record<string, { email: string; display_name: string | null }> = {}
  if (userIds.length > 0) {
    const { data: users } = await db
      .from("users")
      .select("id, email, display_name")
      .in("id", userIds)
    for (const u of (users || [])) {
      usersMap[u.id] = { email: u.email, display_name: u.display_name }
    }
  }

  return NextResponse.json({
    analyses: (analyses || []).map((a: Record<string, unknown>) => ({
      ...a,
      owner: usersMap[(a.user_id as string)] || null,
    })),
    total: count || 0,
    page,
    limit,
  })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== ADMIN_USER_ID) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const { analysis_id } = await request.json()
  if (!analysis_id) {
    return NextResponse.json({ error: "analysis_id required" }, { status: 400 })
  }

  const { error } = await db.from("analyses").delete().eq("id", analysis_id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ deleted: true })
}
