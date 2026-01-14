"use client"

/**
 * OAuth Callback Handler (Client-Side)
 * 
 * Handles the OAuth callback from providers like Google.
 * Exchanges the code for a session using the browser client
 * so the session is stored in localStorage.
 */
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function AuthCallback() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = getSupabaseClient()
      if (!supabase) {
        setError("Supabase client not available")
        return
      }

      // Get the code from URL
      const params = new URLSearchParams(window.location.search)
      const code = params.get("code")
      
      if (!code) {
        setError("No authorization code found")
        return
      }

      try {
        console.log("[Auth Callback] Exchanging code for session...")
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (error) {
          console.error("[Auth Callback] Error:", error)
          setError(error.message)
          return
        }

        console.log("[Auth Callback] Success, redirecting to /app")
        router.push("/app")
      } catch (err) {
        console.error("[Auth Callback] Exception:", err)
        setError("Authentication failed")
      }
    }

    handleCallback()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center p-8 bg-slate-900 rounded-lg border border-red-500/30">
          <h1 className="text-xl font-bold text-red-400 mb-2">Authentication Error</h1>
          <p className="text-slate-400">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-slate-800 rounded hover:bg-slate-700 transition"
          >
            Return Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-slate-400">Completing sign in...</p>
      </div>
    </div>
  )
}
