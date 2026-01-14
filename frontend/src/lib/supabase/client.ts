/**
 * Supabase Browser Client
 * 
 * Creates a Supabase client for use in Client Components.
 * This client handles auth state automatically via cookies.
 */
import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Singleton for client-side usage
let client: SupabaseClient<Database> | null = null

export function createClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase configuration")
  }
  
  return createBrowserClient<Database>(supabaseUrl, supabaseKey)
}

export function getSupabaseClient(): SupabaseClient<Database> {
  // During SSR, return a dummy that will be replaced on client
  if (typeof window === "undefined") {
    // Return existing client or create one that will work during hydration
    if (!client) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (supabaseUrl && supabaseKey) {
        client = createBrowserClient<Database>(supabaseUrl, supabaseKey)
      }
    }
    return client as SupabaseClient<Database>
  }
  
  if (!client) {
    client = createClient()
  }
  return client
}
