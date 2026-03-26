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

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split("T")[0]

  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const weekStr = sevenDaysAgo.toISOString().split("T")[0]

  const [
    usersRes,
    activeUsersRes,
    proUsersRes,
    demoUsersRes,
    totalAnalysesRes,
    analysesTodayRes,
    analysesWeekRes,
    vocabRes,
    vocabMasteredRes,
    recentAnalysesRes,
    recentUsersRes,
  ] = await Promise.all([
    db.from("users").select("*", { count: "exact", head: true }),
    db.from("users").select("*", { count: "exact", head: true }).gte("last_active_date", weekStr),
    db.from("users").select("*", { count: "exact", head: true }).eq("is_pro", true),
    db.from("users").select("*", { count: "exact", head: true }).neq("account_type", "regular"),
    db.from("analyses").select("*", { count: "exact", head: true }),
    db.from("analyses").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
    db.from("analyses").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo.toISOString()),
    db.from("vocabulary").select("*", { count: "exact", head: true }),
    db.from("vocabulary").select("*", { count: "exact", head: true }).gte("mastery", 80),
    db.from("analyses").select("id, text, language, created_at, user_id").order("created_at", { ascending: false }).limit(10),
    db.from("users").select("id, email, display_name, created_at, account_type").order("created_at", { ascending: false }).limit(5),
  ])

  const { data: langData } = await db.from("analyses").select("language")
  const langCounts: Record<string, number> = {}
  for (const row of (langData || [])) {
    langCounts[row.language] = (langCounts[row.language] || 0) + 1
  }

  return NextResponse.json({
    users: {
      total: usersRes.count || 0,
      active_this_week: activeUsersRes.count || 0,
      pro: proUsersRes.count || 0,
      demo: demoUsersRes.count || 0,
    },
    analyses: {
      total: totalAnalysesRes.count || 0,
      today: analysesTodayRes.count || 0,
      this_week: analysesWeekRes.count || 0,
      by_language: langCounts,
    },
    vocabulary: {
      total: vocabRes.count || 0,
      mastered: vocabMasteredRes.count || 0,
    },
    recent_analyses: recentAnalysesRes.data || [],
    recent_users: recentUsersRes.data || [],
  })
}
