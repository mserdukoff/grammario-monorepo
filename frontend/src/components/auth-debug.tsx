"use client"

/**
 * Auth Debug Component
 *
 * Temporarily add this to your app to debug production auth issues.
 * Remove after debugging is complete.
 *
 * Usage: Add <AuthDebug /> to your main app page
 */

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"

export function AuthDebug() {
  const { user, session, loading } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    if (typeof window === "undefined") return

    const info: any = {
      origin: window.location.origin,
      pathname: window.location.pathname,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      localStorageAvailable: typeof localStorage !== "undefined",
      authDataExists: false,
      authDataValid: false,
      accessTokenExists: false,
      refreshTokenExists: false,
      expiresAt: null,
      userFromAuth: !!user,
      sessionFromAuth: !!session,
      authLoading: loading,
    }

    try {
      const authData = localStorage.getItem("grammario-auth-token")
      if (authData) {
        info.authDataExists = true
        const parsed = JSON.parse(authData)
        info.authDataValid = true
        info.accessTokenExists = !!parsed.access_token
        info.refreshTokenExists = !!parsed.refresh_token
        info.expiresAt = parsed.expires_at
          ? new Date(parsed.expires_at * 1000).toISOString()
          : null
      }
    } catch (e) {
      info.parseError = String(e)
    }

    setDebugInfo(info)
    console.log("=== AUTH DEBUG INFO ===", info)
  }, [user, session, loading])

  // Only show in development or if explicitly enabled
  if (process.env.NODE_ENV === "production" && !window.location.search.includes("debug=true")) {
    return null
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        right: 0,
        maxWidth: "400px",
        maxHeight: "50vh",
        overflow: "auto",
        background: "#1e293b",
        color: "#fff",
        padding: "1rem",
        borderRadius: "8px 0 0 0",
        fontSize: "12px",
        fontFamily: "monospace",
        zIndex: 9999,
        border: "2px solid #3b82f6",
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "0.5rem", color: "#3b82f6" }}>
        🔍 Auth Debug Panel
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <strong>Environment:</strong>
        <div style={{ color: debugInfo.supabaseUrl ? "#22c55e" : "#ef4444" }}>
          Supabase URL: {debugInfo.supabaseUrl || "MISSING"}
        </div>
        <div style={{ color: debugInfo.hasSupabaseKey ? "#22c55e" : "#ef4444" }}>
          Anon Key: {debugInfo.hasSupabaseKey ? "SET" : "MISSING"}
        </div>
        <div>Origin: {debugInfo.origin}</div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <strong>Storage:</strong>
        <div style={{ color: debugInfo.localStorageAvailable ? "#22c55e" : "#ef4444" }}>
          localStorage: {debugInfo.localStorageAvailable ? "Available" : "BLOCKED"}
        </div>
        <div style={{ color: debugInfo.authDataExists ? "#22c55e" : "#ef4444" }}>
          Auth Data: {debugInfo.authDataExists ? "EXISTS" : "MISSING"}
        </div>
        {debugInfo.authDataExists && (
          <>
            <div style={{ color: debugInfo.accessTokenExists ? "#22c55e" : "#ef4444" }}>
              Access Token: {debugInfo.accessTokenExists ? "EXISTS" : "MISSING"}
            </div>
            <div style={{ color: debugInfo.refreshTokenExists ? "#22c55e" : "#ef4444" }}>
              Refresh Token: {debugInfo.refreshTokenExists ? "EXISTS" : "MISSING"}
            </div>
            <div>Expires: {debugInfo.expiresAt || "N/A"}</div>
          </>
        )}
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <strong>Auth Context:</strong>
        <div style={{ color: loading ? "#eab308" : "#22c55e" }}>
          Loading: {loading ? "YES" : "NO"}
        </div>
        <div style={{ color: user ? "#22c55e" : "#ef4444" }}>
          User: {user ? `${user.email}` : "NULL"}
        </div>
        <div style={{ color: session ? "#22c55e" : "#ef4444" }}>
          Session: {session ? "EXISTS" : "NULL"}
        </div>
      </div>

      {debugInfo.parseError && (
        <div style={{ color: "#ef4444", marginTop: "1rem" }}>
          <strong>Error:</strong>
          <div>{debugInfo.parseError}</div>
        </div>
      )}

      <div style={{ marginTop: "1rem", fontSize: "10px", color: "#94a3b8" }}>
        Add ?debug=true to URL to show in production
      </div>
    </div>
  )
}
