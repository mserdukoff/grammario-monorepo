"use client"

/**
 * OAuth Callback Handler (Client-Side)
 *
 * The Supabase client (with detectSessionInUrl: true and flowType: "pkce")
 * automatically exchanges the authorization code on initialization.
 * This page only needs to:
 *   1. Check for OAuth error params in the URL
 *   2. Wait for the AuthProvider to update user state
 *   3. Redirect to /app once authenticated
 *
 * IMPORTANT: Do NOT manually call exchangeCodeForSession here — the Supabase
 * client's auto-detection handles it. Calling it twice causes a race condition
 * where the PKCE code verifier is consumed by the first exchange, and the
 * second fails.
 */
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

const STORAGE_KEY = "grammario-auth-token"

export default function AuthCallback() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>("Completing sign in...")
  const redirected = useRef(false)

  useEffect(() => {
    if (redirected.current) return
    if (!loading && user) {
      redirected.current = true
      router.replace("/app")
    }
  }, [user, loading, router])

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const hashError = hashParams.get("error")
    const hashErrorDesc = hashParams.get("error_description")

    if (hashError) {
      setError(hashErrorDesc || hashError)
      return
    }

    const params = new URLSearchParams(window.location.search)
    const errorParam = params.get("error")
    const errorDesc = params.get("error_description")

    if (errorParam) {
      setError(errorDesc || errorParam)
      return
    }

    const hasCode = params.has("code")
    const hasToken = hashParams.has("access_token")

    if (hasCode) {
      const verifier = localStorage.getItem(`${STORAGE_KEY}-code-verifier`)
      if (!verifier) {
        setError(
          "Authentication failed: session data not found. " +
            "This usually means you were redirected to a different domain " +
            "than where you started sign-in. Please make sure you're " +
            "accessing the app from the correct URL and try again."
        )
        return
      }
      setStatus("Processing authentication...")
    } else if (hasToken) {
      setStatus("Processing authentication...")
    } else {
      setStatus("Checking authentication...")
    }

    const timeout = setTimeout(() => {
      if (!redirected.current) {
        setError(
          "Authentication timed out. This can happen if the sign-in " +
            "link expired or the redirect URL is misconfigured. " +
            "Please try signing in again."
        )
      }
    }, 10000)

    return () => clearTimeout(timeout)
  }, [])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center p-8 bg-slate-900 rounded-lg border border-red-500/30 max-w-md">
          <h1 className="text-xl font-bold text-red-400 mb-2">
            Authentication Error
          </h1>
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
