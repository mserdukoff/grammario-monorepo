import { getSupabaseClient } from "./supabase/client"

/**
 * Wrapper around fetch() that attaches the current Supabase session's
 * access token as a Bearer Authorization header. Use this for all
 * calls to Next.js API routes so the server can authenticate the user.
 */
export async function authFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const supabase = getSupabaseClient()
  let token: string | undefined

  if (supabase) {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    token = session?.access_token
  }

  const headers = new Headers(options?.headers)
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  return fetch(url, { ...options, headers })
}
