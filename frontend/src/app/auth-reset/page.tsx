"use client"

/**
 * Auth Reset Utility Page
 *
 * Visit /auth-reset to completely clear all auth state
 * Useful for debugging broken auth states
 */

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function AuthResetPage() {
  const router = useRouter()
  const [status, setStatus] = useState("Initializing...")
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
    console.log(message)
  }

  useEffect(() => {
    const resetAuth = async () => {
      try {
        setStatus("Clearing authentication state...")
        addLog("Starting auth reset...")

        // Step 1: Sign out from Supabase
        addLog("Signing out from Supabase...")
        const supabase = getSupabaseClient()
        if (supabase) {
          try {
            await supabase.auth.signOut()
            addLog("✓ Supabase sign out completed")
          } catch (e) {
            addLog(`⚠ Supabase sign out error (continuing anyway): ${e}`)
          }
        } else {
          addLog("⚠ No Supabase client found")
        }

        // Step 2: Clear all localStorage
        setStatus("Clearing localStorage...")
        addLog("Clearing all localStorage...")
        const keysToRemove = [
          "grammario-auth-token",
          "sb-auth-token",
          "supabase.auth.token",
        ]

        keysToRemove.forEach((key) => {
          if (localStorage.getItem(key)) {
            localStorage.removeItem(key)
            addLog(`✓ Removed localStorage key: ${key}`)
          }
        })

        // Also clear any other Supabase keys
        const allKeys = Object.keys(localStorage)
        allKeys.forEach((key) => {
          if (key.includes("supabase") || key.includes("sb-")) {
            localStorage.removeItem(key)
            addLog(`✓ Removed extra key: ${key}`)
          }
        })

        // Step 3: Clear sessionStorage
        setStatus("Clearing sessionStorage...")
        addLog("Clearing sessionStorage...")
        sessionStorage.clear()
        addLog("✓ sessionStorage cleared")

        // Step 4: Clear cookies (if any)
        setStatus("Clearing cookies...")
        addLog("Clearing auth cookies...")
        document.cookie.split(";").forEach((c) => {
          if (c.includes("supabase") || c.includes("sb-")) {
            const name = c.split("=")[0].trim()
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
            addLog(`✓ Cleared cookie: ${name}`)
          }
        })

        // Step 5: Wait a moment
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Step 6: Verify everything is clear
        setStatus("Verifying cleanup...")
        addLog("Verifying cleanup...")
        const remainingKeys = Object.keys(localStorage).filter(
          (k) => k.includes("supabase") || k.includes("sb-") || k.includes("grammario")
        )

        if (remainingKeys.length > 0) {
          addLog(`⚠ Warning: ${remainingKeys.length} keys remaining: ${remainingKeys.join(", ")}`)
        } else {
          addLog("✓ All auth data cleared successfully")
        }

        setStatus("✓ Reset complete! Redirecting...")
        addLog("✓ Auth reset complete!")

        // Step 7: Redirect to home
        await new Promise((resolve) => setTimeout(resolve, 2000))
        addLog("Redirecting to home page...")
        window.location.href = "/"
      } catch (error) {
        setStatus(`Error: ${error}`)
        addLog(`✗ Error during reset: ${error}`)
      }
    }

    resetAuth()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h1 className="text-3xl font-bold mb-4 text-center">🔄 Auth Reset</h1>

          <div className="mb-6">
            <div className="text-center text-lg mb-4">
              <span className="animate-pulse">{status}</span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 transition-all duration-500 animate-pulse"
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
            <h2 className="text-sm font-semibold mb-2 text-slate-400">Activity Log:</h2>
            <div className="space-y-1 max-h-64 overflow-y-auto font-mono text-xs">
              {logs.map((log, i) => (
                <div
                  key={i}
                  className={`
                    ${log.includes("✓") ? "text-green-400" : ""}
                    ${log.includes("⚠") ? "text-yellow-400" : ""}
                    ${log.includes("✗") ? "text-red-400" : ""}
                    ${!log.includes("✓") && !log.includes("⚠") && !log.includes("✗") ? "text-slate-400" : ""}
                  `}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-slate-500">
            <p>This page will automatically redirect you to the home page</p>
            <p className="mt-2">You can then try logging in again with a fresh state</p>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-slate-600">
          <p>If you're not redirected automatically, <a href="/" className="text-indigo-400 hover:underline">click here</a></p>
        </div>
      </div>
    </div>
  )
}
