/**
 * Supabase Browser Client
 * 
 * Creates a Supabase client for use in Client Components.
 * Uses standard @supabase/supabase-js with localStorage.
 * 
 * IMPORTANT: Only use in browser environment (client components with useEffect)
 */
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Singleton for client-side usage
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: any = null

export function createClient() {
  // Never create during SSR
  if (typeof window === "undefined") {
    return null
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("[Supabase] MISSING ENV VARS")
    return null
  }

  console.log("[Supabase] Creating client for:", supabaseUrl)
  return createSupabaseClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      // Ensure sessions persist in localStorage
      persistSession: true,
      // Use localStorage for session storage (default but explicit is better)
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      // Detect session in URL hash fragment (for OAuth redirects)
      detectSessionInUrl: true,
      // Use implicit flow for OAuth (simpler, works well for SPAs)
      flowType: "implicit",
      // Auto-refresh tokens before they expire
      autoRefreshToken: true,
      // Use a unique storage key specific to this app
      storageKey: "grammario-auth-token",
      // Automatically detect session in URL and store it
      debug: false,
    },
  })
}

export function getSupabaseClient() {
  // Never create during SSR
  if (typeof window === "undefined") {
    return null
  }

  if (!client) {
    client = createClient()
    // Log storage info for debugging production issues
    if (client) {
      console.log("[Supabase] Client initialized for origin:", window.location.origin)
      console.log("[Supabase] localStorage available:", typeof window.localStorage !== "undefined")
    }
  }
  return client
}
