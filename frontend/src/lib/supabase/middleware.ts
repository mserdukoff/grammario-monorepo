/**
 * Supabase Middleware Client
 * 
 * Handles auth session refresh in Next.js middleware.
 * 
 * NOTE: Since we use localStorage-based auth (standard @supabase/supabase-js),
 * this middleware only handles OAuth code redirects. Session refresh is 
 * handled client-side.
 */
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  
  // Handle OAuth callback code on root URL - redirect to proper callback handler
  // This happens when Supabase redirects with code to Site URL instead of redirectTo
  if (pathname === "/" && searchParams.has("code")) {
    const code = searchParams.get("code")
    const redirectUrl = new URL("/auth/callback", request.url)
    redirectUrl.searchParams.set("code", code!)
    return NextResponse.redirect(redirectUrl)
  }

  // Also handle code on other pages (just in case)
  if (searchParams.has("code") && !pathname.startsWith("/auth/callback")) {
    const code = searchParams.get("code")
    const redirectUrl = new URL("/auth/callback", request.url)
    redirectUrl.searchParams.set("code", code!)
    // Preserve the intended destination
    redirectUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Simply pass through - auth is handled client-side via localStorage
  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
}
