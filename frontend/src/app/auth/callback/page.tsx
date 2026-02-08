"use client"

/**
 * OAuth Callback Handler (Client-Side)
 * 
 * Handles the OAuth callback from providers like Google.
 * For implicit flow (hash fragment), the Supabase client auto-processes it.
 * For PKCE flow (code in query), we exchange the code for a session.
 */
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"

export default function AuthCallback() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>("Completing sign in...")

  // Redirect once user is authenticated
  useEffect(() => {
    if (!loading && user) {
      // Use replace to avoid back button issues
      router.replace("/app")
    } else if (!loading && !user && error) {
      // If we have an error and no user after loading completes, stay on error screen
    }
  }, [user, loading, error, router])

  // Handle PKCE flow (code in query params) or check for errors
  useEffect(() => {
    const handleCallback = async () => {
      // Check for error in hash (OAuth error)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const hashError = hashParams.get("error")
      const hashErrorDesc = hashParams.get("error_description")
      
      if (hashError) {
        setError(hashErrorDesc || hashError)
        return
      }

      // Check for access_token in hash (implicit flow)
      // The AuthProvider's onAuthStateChange will handle this automatically
      if (hashParams.get("access_token")) {
        setStatus("Processing authentication...")
        return // AuthProvider will handle it
      }

      // Check for code in query params (PKCE flow)
      const params = new URLSearchParams(window.location.search)
      const code = params.get("code")
      const errorParam = params.get("error")
      const errorDesc = params.get("error_description")
      
      if (errorParam) {
        setError(errorDesc || errorParam)
        return
      }
      
      if (code) {
        setStatus("Exchanging authorization code...")
        
        const supabase = getSupabaseClient()
        if (!supabase) {
          setError("Authentication service unavailable")
          return
        }

        try {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            setError(exchangeError.message)
            return
          }
          
          setStatus("Sign in successful!")
          // The onAuthStateChange in AuthProvider will update user state
          // and trigger the redirect via the first useEffect
        } catch (err) {
          setError("Authentication failed. Please try again.")
        }
        return
      }

      // No auth data in URL - wait a moment to see if AuthProvider picks up existing session
      setStatus("Checking authentication...")
      
      // Give AuthProvider time to check existing session
      setTimeout(() => {
        // If still no user after 3 seconds, show error
        setError("No authentication data found. Please try signing in again.")
      }, 3000)
    }

    handleCallback()
  }, [])

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
              onClick={() => {
                // Clear the error and try signing in fresh
                window.location.href = "/"
              }}
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
