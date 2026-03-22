import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ADMIN_USER_ID } from "@/lib/admin"

const NLP_BACKEND_URL = process.env.API_URL || "http://127.0.0.1:8000"

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== ADMIN_USER_ID) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const res = await fetch(`${NLP_BACKEND_URL}/health`, {
      signal: controller.signal,
      cache: "no-store",
    })
    clearTimeout(timeout)

    if (!res.ok) {
      return NextResponse.json(
        { status: "error", message: `Backend returned ${res.status}` },
        { status: 502 }
      )
    }

    const health = await res.json()
    return NextResponse.json(health)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json(
      { status: "unreachable", message: `Cannot reach backend: ${message}` },
      { status: 503 }
    )
  }
}
