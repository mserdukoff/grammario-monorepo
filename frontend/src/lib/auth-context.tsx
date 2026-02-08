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
      return null
    }

    const today = new Date().toISOString().split("T")[0]

    // Check if user exists with timeout to prevent hanging
    const fetchStart = Date.now()
    
    // Use AbortController for proper timeout handling
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
    }, 8000) // 8 second timeout (increased from 3s)

    let existing, fetchError
    try {
      // Use abortSignal to cancel request if it times out
      const result = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle()
        .abortSignal(controller.signal)
      
      clearTimeout(timeoutId)
      existing = result.data
      fetchError = result.error

    } catch (error: any) {
      clearTimeout(timeoutId)
      // If query times out or fails, return null to trigger fallback
      return null
    }

    // Log for debugging
    if (fetchError) {
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
        // Return existing data if update fails
        return existingUser
      }

      return updated as User
    } else {
      // New user - create profile
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

      if (error) {
        return null
      }

      return newUser as User
    }
  } catch (error) {
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
    setProfileLoading(true)
    try {
      const userProfile = await createOrUpdateUserProfile(
        authUser.id,
        authUser.email || "",
        authUser.user_metadata?.full_name || authUser.user_metadata?.name,
        authUser.user_metadata?.avatar_url
      )

      // If profile loading failed (returned null), use fallback
      if (!userProfile) {
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
      } else {
        setProfile(userProfile)
      }
    } catch (error) {
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
    const supabase = getSupabaseClient()

    // During SSR or if client not available, just set loading to false
    if (!supabase) {
      setLoading(false)
      return
    }

    let mounted = true
    let sessionInitialized = false

    // Safety timeout - never let loading hang forever
    const safetyTimeout = setTimeout(() => {
      if (mounted && !sessionInitialized) {
        setLoading(false)
      }
    }, 10000) // Increased to 10s to match query timeout

    // Listen for auth changes - this handles:
    // 1. Hash fragment processing (OAuth redirects)
    // 2. Session changes during app usage
    // 3. Token refresh events
    // 4. Sign out events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: Session | null) => {
      if (!mounted) {
        return
      }

      clearTimeout(safetyTimeout)
      sessionInitialized = true

      setSession(session)
      setUser(session?.user ?? null)
      
      // Set loading to false immediately so UI updates
      setLoading(false)

      if (session?.user) {
        // Don't await profile loading - let it run in background
        loadProfile(session.user).catch((error) => {
          // Silent catch
        })
      } else {
        setProfile(null)
      }
    })

    // Initialize session on mount
    // This restores the session from localStorage on page refresh
    const initializeSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (!mounted) {
          return
        }

        clearTimeout(safetyTimeout)
        sessionInitialized = true

        if (error) {
          setLoading(false)
          return
        }

        // Only update state if we have a session and haven't already initialized
        // (onAuthStateChange might have already fired)
        if (session) {
          setSession(session)
          setUser(session.user)
          
          // Don't await profile loading - let it run in background
          loadProfile(session.user).catch((error) => {
            // Silent catch
          })
        }

        setLoading(false)
      } catch (error) {
        if (mounted) {
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
          // Ignore
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
