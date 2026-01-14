"use client"

/**
 * OAuth Callback Handler (Client-Side)
 * 
 * Handles the OAuth callback from providers like Google.
 * Exchanges the code for a session using the browser client
 * so the session is stored in localStorage.
 */
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function AuthCallback() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>("Initializing...")
  const hasRun = useRef(false)

  useEffect(() => {
    // Prevent double-execution in React Strict Mode
    if (hasRun.current) return
    hasRun.current = true

    const handleCallback = async () => {
      console.log("[Auth Callback] Starting callback handling...")
      console.log("[Auth Callback] URL:", window.location.href)
      
      const supabase = getSupabaseClient()
      if (!supabase) {
        setError("Supabase client not available")
        return
      }

      // Check for hash fragment (implicit flow) - Supabase client handles this automatically
      // but we should wait for it
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get("access_token")
      
      if (accessToken) {
        console.log("[Auth Callback] Found access_token in hash (implicit flow)")
        setStatus("Processing session...")
        // The Supabase client automatically handles the hash fragment
        // Wait a moment for onAuthStateChange to fire
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Check if we have a session now
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          console.log("[Auth Callback] Session established from hash, redirecting...")
          router.replace("/app")
          return
        }
      }

      // Check for code in query params (PKCE flow)
      const params = new URLSearchParams(window.location.search)
      const code = params.get("code")
      const next = params.get("next") || "/app"
      
      if (code) {
        console.log("[Auth Callback] Found code in query params (PKCE flow)")
        setStatus("Exchanging code for session...")
        
        try {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            console.error("[Auth Callback] Exchange error:", exchangeError)
            // Don't immediately show error - check if session exists anyway
            // (sometimes the code is already used but session is valid)
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
              console.log("[Auth Callback] Session exists despite error, redirecting...")
              router.replace(next)
              return
            }
            setError(exchangeError.message)
            return
          }

          if (data.session) {
            console.log("[Auth Callback] Code exchange successful, redirecting to", next)
            router.replace(next)
            return
          }
        } catch (err) {
          console.error("[Auth Callback] Exception during code exchange:", err)
          // Check if session exists anyway
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            console.log("[Auth Callback] Session exists despite exception, redirecting...")
            router.replace(next)
            return
          }
          setError("Authentication failed. Please try again.")
          return
        }
      }

      // No code or token found - check if already authenticated
      console.log("[Auth Callback] No code or token in URL, checking existing session...")
      setStatus("Checking authentication status...")
      
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        console.log("[Auth Callback] Already authenticated, redirecting...")
        router.replace("/app")
        return
      }

      // Nothing worked
      console.log("[Auth Callback] No authentication method found")
      setError("No authentication code found. Please try signing in again.")
    }

    handleCallback()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center p-8 bg-slate-900 rounded-lg border border-red-500/30 max-w-md">
          <h1 className="text-xl font-bold text-red-400 mb-2">Authentication Error</h1>
          <p className="text-slate-400 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-slate-800 rounded hover:bg-slate-700 transition"
            >
              Return Home
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-500 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-slate-400">{status}</p>
      </div>
    </div>
  )
}
