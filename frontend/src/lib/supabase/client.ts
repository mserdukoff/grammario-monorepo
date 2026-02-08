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
    return null
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      // Ensure sessions persist in localStorage
      persistSession: true,
      // Use localStorage for session storage (default but explicit is better)
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      // Detect session in URL hash fragment (for OAuth redirects)
      detectSessionInUrl: true,
      // Use PKCE flow for OAuth (more secure, better for token refresh)
      flowType: "pkce",
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
  }
  return client
}
