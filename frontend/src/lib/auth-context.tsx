"use client"

/**
 * Authentication Context Provider
 * 
 * Provides user authentication state and methods throughout the app.
 * Uses Supabase Auth with PostgreSQL for user profiles.
 */
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { getSupabaseClient } from "./supabase/client"
import type { User as SupabaseUser, Session } from "@supabase/supabase-js"
import type { User } from "./supabase/database.types"

// XP required for each level (exponential growth)
export const XP_PER_LEVEL = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000]

export function calculateLevel(xp: number): number {
  for (let i = XP_PER_LEVEL.length - 1; i >= 0; i--) {
    if (xp >= XP_PER_LEVEL[i]) return i + 1
  }
  return 1
}

export function xpForNextLevel(level: number): number {
  return XP_PER_LEVEL[level] || XP_PER_LEVEL[XP_PER_LEVEL.length - 1] * 2
}

export function xpProgress(xp: number, level: number): number {
  const currentLevelXp = XP_PER_LEVEL[level - 1] || 0
  const nextLevelXp = XP_PER_LEVEL[level] || XP_PER_LEVEL[XP_PER_LEVEL.length - 1] * 2
  return ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100
}

interface AuthContextType {
  user: SupabaseUser | null
  profile: User | null
  session: Session | null
  loading: boolean
  profileLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

async function createOrUpdateUserProfile(
  userId: string,
  email: string,
  displayName?: string | null,
  avatarUrl?: string | null
): Promise<User | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = getSupabaseClient() as any

    if (!supabase) {
      console.error("[Profile] Supabase client not available")
      return null
    }

    console.log("[Profile] Starting createOrUpdateUserProfile for:", userId)
    const today = new Date().toISOString().split("T")[0]

    // Check if user exists with timeout to prevent hanging
    console.log("[Profile] Querying users table...")
    const fetchStart = Date.now()

    // Create abort controller for timeout
    const abortController = new AbortController()
    const timeoutId = setTimeout(() => {
      console.warn("[Profile] Query taking too long, aborting...")
      abortController.abort()
    }, 5000) // 5 second timeout

    let existing, fetchError
    try {
      const result = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .abortSignal(abortController.signal)
        .maybeSingle()

      clearTimeout(timeoutId)
      existing = result.data
      fetchError = result.error

      const fetchDuration = Date.now() - fetchStart
      console.log(`[Profile] Query completed in ${fetchDuration}ms - exists:`, !!existing, "error:", fetchError?.message || "none")
    } catch (error: any) {
      clearTimeout(timeoutId)
      const fetchDuration = Date.now() - fetchStart
      console.error(`[Profile] Query failed after ${fetchDuration}ms:`, error)

      // If query times out or fails, return null to trigger fallback
      return null
    }

    // Log for debugging
    if (fetchError) {
      console.error("[Profile] Error fetching user profile:", fetchError)
      // Don't throw - we'll try to create the user instead
    }

    if (existing) {
      // Existing user - update streak and last active
      const existingUser = existing as User
      let newStreak = existingUser.streak || 1
      const lastActive = existingUser.last_active_date

      if (lastActive) {
        const lastDate = new Date(lastActive)
        const todayDate = new Date(today)
        const diffDays = Math.floor(
          (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (diffDays === 1) {
          // Consecutive day - increment streak
          newStreak = existingUser.streak + 1
        } else if (diffDays > 1) {
          // Streak broken
          newStreak = 1
        }
        // Same day - keep current streak
      }

      const { data: updated, error } = await supabase
        .from("users")
        .update({
          last_active_date: today,
          streak: newStreak,
          longest_streak: Math.max(newStreak, existingUser.longest_streak || 0),
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .maybeSingle()

      if (error) {
        console.error("[Profile] Error updating user:", error)
        // Return existing data if update fails
        return existingUser
      }

      console.log("[Profile] User updated successfully")
      return updated as User
    } else {
      // New user - create profile
      console.log("[Profile] User doesn't exist, creating new profile...")
      const insertStart = Date.now()
      const { data: newUser, error } = await supabase
        .from("users")
        .insert({
          id: userId,
          email,
          display_name: displayName || email.split("@")[0],
          avatar_url: avatarUrl,
          is_pro: false,
          xp: 0,
          level: 1,
          streak: 1,
          longest_streak: 1,
          last_active_date: today,
          total_analyses: 0,
        })
        .select()
        .maybeSingle()

      const insertDuration = Date.now() - insertStart
      console.log(`[Profile] Insert completed in ${insertDuration}ms - success:`, !!newUser, "error:", error?.message || "none")

      if (error) {
        console.error("[Profile] Error creating user:", error)
        return null
      }

      console.log("[Profile] User created successfully")
      return newUser as User
    }
  } catch (error) {
    console.error("[Profile] Unexpected error in createOrUpdateUserProfile:", error)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  const loadProfile = useCallback(async (authUser: SupabaseUser) => {
    console.log("[Auth] loadProfile called for user:", authUser.email)
    setProfileLoading(true)
    try {
      console.log("[Auth] Calling createOrUpdateUserProfile...")
      const userProfile = await createOrUpdateUserProfile(
        authUser.id,
        authUser.email || "",
        authUser.user_metadata?.full_name || authUser.user_metadata?.name,
        authUser.user_metadata?.avatar_url
      )
      console.log("[Auth] Profile loaded:", !!userProfile)
      setProfile(userProfile)
    } catch (error) {
      console.error("[Auth] Failed to load profile:", error)
      // Set a basic profile even if DB fails - don't block the user
      setProfile({
        id: authUser.id,
        email: authUser.email || "",
        display_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User",
        avatar_url: authUser.user_metadata?.avatar_url || null,
        is_pro: false,
        xp: 0,
        level: 1,
        streak: 0,
        longest_streak: 0,
        last_active_date: null,
        total_analyses: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as User)
    } finally {
      setProfileLoading(false)
    }
  }, [])

  // Listen to auth state changes - only runs in browser
  useEffect(() => {
    console.log("[Auth] useEffect running...")
    const supabase = getSupabaseClient()

    // During SSR or if client not available, just set loading to false
    if (!supabase) {
      console.log("[Auth] No supabase client (SSR), setting loading false")
      setLoading(false)
      return
    }

    let mounted = true
    let sessionInitialized = false

    // Safety timeout - never let loading hang forever
    const safetyTimeout = setTimeout(() => {
      if (mounted && !sessionInitialized) {
        console.warn("[Auth] Safety timeout reached - forcing loading to false")
        setLoading(false)
      }
    }, 8000)

    // Listen for auth changes - this handles:
    // 1. Hash fragment processing (OAuth redirects)
    // 2. Session changes during app usage
    // 3. Token refresh events
    // 4. Sign out events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: Session | null) => {
      console.log("[Auth] onAuthStateChange event:", event, "session:", !!session, "user:", !!session?.user)

      if (!mounted) {
        console.log("[Auth] Component unmounted, skipping auth state change")
        return
      }

      clearTimeout(safetyTimeout)
      sessionInitialized = true

      console.log("[Auth] Setting session and user state...")
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        console.log("[Auth] Session has user, loading profile...")
        try {
          await loadProfile(session.user)
          console.log("[Auth] Profile loaded successfully")
        } catch (error) {
          console.error("[Auth] Error loading profile:", error)
        }
      } else {
        console.log("[Auth] No user in session, clearing profile")
        setProfile(null)
      }

      console.log("[Auth] Setting loading to false")
      setLoading(false)
    })

    // Initialize session on mount
    // This restores the session from localStorage on page refresh
    const initializeSession = async () => {
      try {
        console.log("[Auth] initializeSession: Starting...")
        const { data: { session }, error } = await supabase.auth.getSession()

        console.log("[Auth] initializeSession: getSession returned, session:", !!session, "error:", !!error)

        if (!mounted) {
          console.log("[Auth] initializeSession: Component unmounted, aborting")
          return
        }

        clearTimeout(safetyTimeout)
        sessionInitialized = true

        if (error) {
          console.error("[Auth] initializeSession: getSession error:", error)
          setLoading(false)
          return
        }

        console.log("[Auth] initializeSession: Session initialized:", !!session)

        // Only update state if we have a session and haven't already initialized
        // (onAuthStateChange might have already fired)
        if (session) {
          console.log("[Auth] initializeSession: Setting session and user state")
          setSession(session)
          setUser(session.user)
          console.log("[Auth] initializeSession: Loading profile...")
          await loadProfile(session.user)
          console.log("[Auth] initializeSession: Profile loaded")
        } else {
          console.log("[Auth] initializeSession: No session found")
        }

        console.log("[Auth] initializeSession: Setting loading to false")
        setLoading(false)
      } catch (error) {
        if (mounted) {
          console.error("[Auth] Session initialization error:", error)
          clearTimeout(safetyTimeout)
          setLoading(false)
        }
      }
    }

    initializeSession()

    return () => {
      mounted = false
      clearTimeout(safetyTimeout)
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const signIn = async (email: string, password: string) => {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase client not available")
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase client not available")
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: displayName,
        },
      },
    })
    if (error) throw error
  }

  const signInWithGoogle = async () => {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase client not available")
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
  }

  const signOut = async () => {
    try {
      const supabase = getSupabaseClient()
      if (supabase) {
        await supabase.auth.signOut()
      }
    } catch (error) {
      console.error("[Auth] Sign out error:", error)
      // Continue with local cleanup even if Supabase signOut fails
    } finally {
      // Always clear local state, regardless of API call success
      setUser(null)
      setProfile(null)
      setSession(null)

      // Clear localStorage manually as a failsafe
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("grammario-auth-token")
          localStorage.removeItem("sb-auth-token")
        } catch (e) {
          console.error("[Auth] Failed to clear localStorage:", e)
        }
      }
    }
  }

  const resetPassword = async (email: string) => {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase client not available")
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) throw error
  }

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        profileLoading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
