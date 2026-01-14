/**
 * Supabase Browser Client
 * 
 * Creates a Supabase client for use in Client Components.
 * This client handles auth state automatically via cookies.
 */
import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./database.types"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables:", {
      url: !!supabaseUrl,
      key: !!supabaseKey
    })
    throw new Error("Missing Supabase configuration")
  }
  
  return createBrowserClient<Database>(supabaseUrl, supabaseKey)
}

// Singleton for client-side usage
let client: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!client) {
    client = createClient()
  }
  return client
}
