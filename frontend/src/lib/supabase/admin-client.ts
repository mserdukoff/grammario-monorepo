import { createClient } from "@supabase/supabase-js"

let adminClient: ReturnType<typeof createClient> | null = null

/**
 * Returns a Supabase client using the service role key (bypasses RLS).
 * Only needed for auth admin operations (createUser / deleteUser).
 * Returns null if SUPABASE_SERVICE_ROLE_KEY is not configured.
 */
export function getAdminClient() {
  if (adminClient) return adminClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    return null
  }

  adminClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  return adminClient
}
