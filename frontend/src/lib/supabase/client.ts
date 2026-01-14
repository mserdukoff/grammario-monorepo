/**
 * Supabase Browser Client
 * 
 * Creates a Supabase client for use in Client Components.
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
  
  // Debug: show env var status (remove after debugging)
  console.log("[Supabase] URL exists:", !!supabaseUrl, "Key exists:", !!supabaseKey)
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("[Supabase] MISSING ENV VARS")
    return null
  }
  
  console.log("[Supabase] Creating client for:", supabaseUrl)
  return createSupabaseClient<Database>(supabaseUrl, supabaseKey)
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
