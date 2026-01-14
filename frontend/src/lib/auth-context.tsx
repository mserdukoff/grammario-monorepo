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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getSupabaseClient() as any
  const today = new Date().toISOString().split("T")[0]
  
  // Check if user exists
  const { data: existing, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single()
  
  // Log for debugging - can be removed later
  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Error fetching user profile:", fetchError)
  }

  if (existing && !fetchError) {
    // Existing user - update streak and last active
    const existingUser = existing as User
    let newStreak = existingUser.streak
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
        longest_streak: Math.max(newStreak, existingUser.longest_streak),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      console.error("Error updating user:", error)
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
      .single()

    if (error) {
      console.error("Error creating user:", error)
      return null
    }
    return newUser as User
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
      setProfile(userProfile)
    } catch (error) {
      console.error("Failed to load profile:", error)
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

    console.log("[Auth] Supabase client exists, calling getSession...")
    
    // Safety timeout - never let loading hang forever
    const safetyTimeout = setTimeout(() => {
      console.warn("[Auth] Safety timeout reached - forcing loading to false")
      setLoading(false)
    }, 5000)
    
    // Get initial session
    supabase.auth.getSession()
      .then(({ data }: { data: { session: Session | null } }) => {
        clearTimeout(safetyTimeout)
        console.log("[Auth] getSession returned:", !!data.session)
        setSession(data.session)
        setUser(data.session?.user ?? null)
        if (data.session?.user) {
          loadProfile(data.session.user)
        }
        setLoading(false)
      })
      .catch((error: Error) => {
        clearTimeout(safetyTimeout)
        console.error("[Auth] getSession error:", error)
        setLoading(false)
      })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
      console.log("[Auth] onAuthStateChange event, session:", !!session)
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await loadProfile(session.user)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => {
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
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase client not available")
    const { error } = await supabase.auth.signOut()
    if (error) throw error
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
