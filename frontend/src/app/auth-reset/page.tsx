"use client"

/**
 * Auth Reset Utility Page
 *
 * Visit /auth-reset to completely clear all auth state
 * Useful for debugging broken auth states
 */

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// Clear storage IMMEDIATELY before any other code runs
if (typeof window !== "undefined") {
  // Clear localStorage first
  try {
    localStorage.removeItem("grammario-auth-token")
    localStorage.removeItem("sb-auth-token")
    Object.keys(localStorage).forEach((key) => {
      if (key.includes("supabase") || key.includes("sb-")) {
        localStorage.removeItem(key)
      }
    })
  } catch (e) {
    console.error("Failed to clear localStorage:", e)
  }

  // Clear sessionStorage
  try {
    sessionStorage.clear()
  } catch (e) {
    console.error("Failed to clear sessionStorage:", e)
  }
}

export default function AuthResetPage() {
  const router = useRouter()
  const [status, setStatus] = useState("Clearing auth state...")
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
    console.log(message)
  }

  useEffect(() => {
    const resetAuth = async () => {
      try {
        addLog("Starting auth reset...")

        // Step 1: Clear localStorage again (in case anything was added)
        addLog("Clearing localStorage...")
        const keysToRemove = [
          "grammario-auth-token",
          "sb-auth-token",
          "supabase.auth.token",
        ]

        keysToRemove.forEach((key) => {
          try {
            localStorage.removeItem(key)
            addLog(`✓ Removed: ${key}`)
          } catch (e) {
            addLog(`⚠ Failed to remove ${key}`)
          }
        })

        // Clear any other Supabase keys
        const allKeys = Object.keys(localStorage)
        allKeys.forEach((key) => {
          if (key.includes("supabase") || key.includes("sb-")) {
            try {
              localStorage.removeItem(key)
              addLog(`✓ Removed extra key: ${key}`)
            } catch (e) {
              console.error("Failed to remove key:", key, e)
            }
          }
        })

        // Step 2: Clear sessionStorage
        setStatus("Clearing sessionStorage...")
        addLog("Clearing sessionStorage...")
        try {
          sessionStorage.clear()
          addLog("✓ sessionStorage cleared")
        } catch (e) {
          addLog("⚠ Failed to clear sessionStorage")
        }

        // Step 3: Clear cookies (if any)
        setStatus("Clearing cookies...")
        addLog("Clearing auth cookies...")
        try {
          document.cookie.split(";").forEach((c) => {
            const name = c.split("=")[0].trim()
            if (name.includes("supabase") || name.includes("sb-") || name.includes("auth")) {
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`
              addLog(`✓ Cleared cookie: ${name}`)
            }
          })
        } catch (e) {
          addLog("⚠ Failed to clear cookies")
        }

        // Step 4: Verify everything is clear
        setStatus("Verifying cleanup...")
        addLog("Verifying cleanup...")
        const remainingKeys = Object.keys(localStorage).filter(
          (k) => k.includes("supabase") || k.includes("sb-") || k.includes("grammario") || k.includes("auth")
        )

        if (remainingKeys.length > 0) {
          addLog(`⚠ Warning: ${remainingKeys.length} keys remaining: ${remainingKeys.join(", ")}`)
          // Force remove them
          remainingKeys.forEach((key) => {
            try {
              localStorage.removeItem(key)
              addLog(`✓ Force removed: ${key}`)
            } catch (e) {
              addLog(`✗ Failed to force remove: ${key}`)
            }
          })
        } else {
          addLog("✓ All auth data cleared successfully")
        }

        setStatus("✓ Reset complete! Redirecting...")
        addLog("✓ Auth reset complete!")

        // Step 5: Force reload to home (this bypasses the AuthProvider)
        await new Promise((resolve) => setTimeout(resolve, 1500))
        addLog("Force reloading to home page...")

        // Use location.replace for a hard redirect that clears everything
        window.location.replace("/")
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
