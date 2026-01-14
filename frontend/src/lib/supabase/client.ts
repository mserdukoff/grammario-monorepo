/**
 * Supabase Browser Client
 * 
 * Creates a Supabase client for use in Client Components.
 * Uses cookies for session storage to match server-side auth.
 * 
 * IMPORTANT: Only use in browser environment (client components with useEffect)
 */
import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./database.types"

// Singleton for client-side usage
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: any = null
let clientCreationAttempted = false

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
  
  console.log("[Supabase] Creating browser client for:", supabaseUrl)
  
  try {
    return createBrowserClient<Database>(supabaseUrl, supabaseKey)
  } catch (error) {
    console.error("[Supabase] Failed to create client:", error)
    return null
  }
}

export function getSupabaseClient() {
  // Never create during SSR
  if (typeof window === "undefined") {
    return null
  }
  
  // Only try to create once to avoid infinite loops
  if (!client && !clientCreationAttempted) {
    clientCreationAttempted = true
    client = createClient()
  }
  return client
}
