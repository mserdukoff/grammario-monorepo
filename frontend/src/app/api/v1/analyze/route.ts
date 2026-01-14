/**
 * Analyze API Route
 * 
 * Handles rate limiting and proxies requests to the Python NLP backend.
 * Saves analysis results to Supabase for authenticated users.
 */
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Rate limits
const FREE_LIMIT = 100  // Generous for beta
const PRO_LIMIT = 1000
const MAX_TEXT_LENGTH = 1000

// Python backend URL (uses existing API_URL env variable from Vercel)
const NLP_BACKEND_URL = process.env.API_URL || "http://127.0.0.1:8000"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  // Parse request body
  let body: { text?: string; language?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "Invalid JSON body" },
      { status: 400 }
    )
  }
  
  const { text, language } = body
  
  // Validate input
  if (!text || typeof text !== "string") {
    return NextResponse.json(
      { error: "invalid_input", message: "Text is required" },
      { status: 400 }
    )
  }
  
  if (!language || typeof language !== "string") {
    return NextResponse.json(
      { error: "invalid_input", message: "Language is required" },
      { status: 400 }
    )
  }
  
  // Sanitize text
  const cleanText = text.trim().slice(0, MAX_TEXT_LENGTH)
  if (!cleanText) {
    return NextResponse.json(
      { error: "invalid_input", message: "Text cannot be empty" },
      { status: 400 }
    )
  }
  
  // Get current user (optional - allows anonymous usage)
  const { data: { user } } = await supabase.auth.getUser()
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  
  // Check rate limit for authenticated users
  if (user) {
    const { data: profile } = await db
      .from("users")
      .select("is_pro")
      .eq("id", user.id)
      .single()
    
    const isPro = profile?.is_pro ?? false
    const limit = isPro ? PRO_LIMIT : FREE_LIMIT
    
    // Count today's analyses
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayIso = today.toISOString()
    
    const { count } = await db
      .from("analyses")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", todayIso)
    
    const usedToday = count ?? 0
    
    if (usedToday >= limit) {
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      return NextResponse.json(
        {
          error: "rate_limit_exceeded",
          message: `Daily limit of ${limit} analyses reached. ${isPro ? "Contact support for higher limits." : "Upgrade to Pro for more analyses."}`,
          reset_at: Math.floor(tomorrow.getTime() / 1000),
          upgrade_url: "/pricing",
        },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.floor(tomorrow.getTime() / 1000)),
          }
        }
      )
    }
  }
  
  // Proxy to Python NLP backend
  try {
    const nlpResponse = await fetch(`${NLP_BACKEND_URL}/api/v1/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: cleanText, language }),
    })
    
    if (!nlpResponse.ok) {
      const errorData = await nlpResponse.json().catch(() => ({}))
      return NextResponse.json(
        {
          error: "nlp_error",
          message: errorData.detail?.message || errorData.detail || "Analysis failed",
        },
        { status: nlpResponse.status }
      )
    }
    
    const analysisResult = await nlpResponse.json()
    
    // Save analysis to Supabase for authenticated users
    if (user) {
      await db.from("analyses").insert({
        user_id: user.id,
        text: cleanText,
        language,
        translation: analysisResult.pedagogical_data?.translation || null,
        nodes: analysisResult.nodes,
        pedagogical_data: analysisResult.pedagogical_data || null,
      })
    }
    
    return NextResponse.json(analysisResult)
    
  } catch (error) {
    console.error("NLP backend error:", error)
    return NextResponse.json(
      {
        error: "backend_unavailable",
        message: "The analysis service is temporarily unavailable. Please try again.",
      },
      { status: 503 }
    )
  }
}
