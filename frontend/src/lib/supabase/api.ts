/**
 * Server-side Supabase client for API route handlers.
 *
 * Reads the JWT from the Authorization header sent by the browser
 * (via authFetch) and creates a Supabase client scoped to that user.
 * This solves the localStorage↔cookie mismatch: the browser keeps the
 * session in localStorage, passes the token as a header, and the server
 * creates a per-request client with that token.
 */
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { User } from "@supabase/supabase-js"

export async function getAuthenticatedClient(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase configuration")
  }

  const raw = request.headers.get("authorization")
  const token = raw?.startsWith("Bearer ") ? raw.slice(7) : null

  const supabase = createSupabaseClient(supabaseUrl, supabaseKey, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  let user: User | null = null
  if (token) {
    const { data, error } = await supabase.auth.getUser(token)
    if (!error) user = data.user
  }

  return { supabase, user }
}
