import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedClient } from "@/lib/supabase/api"
import { getAdminClient } from "@/lib/supabase/admin-client"
import { ADMIN_USER_ID } from "@/lib/admin"

export async function GET(request: NextRequest) {
  const { user } = await getAuthenticatedClient(request)
  if (!user || user.id !== ADMIN_USER_ID) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getAdminClient() as any

  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get("page") || "1")
  const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 100)
  const offset = (page - 1) * limit

  const { data: items, error, count } = await db
    .from("vocabulary")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ items: items || [], total: count || 0, page, limit })
}
