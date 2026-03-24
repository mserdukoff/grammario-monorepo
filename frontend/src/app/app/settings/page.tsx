"use client"

import { useRouter } from "next/navigation"
import {
  User,
  Volume2,
  Target,
  LogOut,
  ChevronLeft,
  Languages,
} from "lucide-react"

import { AppNavbar } from "@/components/ui/app-navbar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useAppStore } from "@/store/useAppStore"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const router = useRouter()
  const { user, profile, signOut } = useAuth()
  const { preferences, setPreference } = useAppStore()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  if (!user) {
    router.push("/")
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <AppNavbar />

      <main className="flex-1 container max-w-2xl py-8">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-md hover:bg-accent transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-heading text-2xl italic">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account and preferences
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Profile */}
          <section>
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Profile</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name || "User"}
                    className="w-14 h-14 rounded-full"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-xl font-medium text-primary-foreground">
                      {profile?.display_name?.[0]?.toUpperCase() ||
                        profile?.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-lg">{profile?.display_name}</p>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-8 text-sm pt-2">
                <div>
                  <p className="text-2xl font-semibold">{profile?.total_analyses || 0}</p>
                  <p className="text-xs text-muted-foreground">Analyses</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">{profile?.streak || 0}</p>
                  <p className="text-xs text-muted-foreground">Day streak</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">{profile?.level || 1}</p>
                  <p className="text-xs text-muted-foreground">Level</p>
                </div>
              </div>
            </div>
          </section>

          <div className="border-t border-border" />

          {/* Beta */}
          <section>
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Plan</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Beta access</p>
                <p className="text-sm text-muted-foreground">Enjoy unlimited features during beta</p>
              </div>
              <span className="text-xs font-medium text-success bg-success-light px-2.5 py-1 rounded-md">Active</span>
            </div>
          </section>

          <div className="border-t border-border" />

          {/* Preferences */}
          <section>
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Preferences</h2>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Daily goal</p>
                    <p className="text-xs text-muted-foreground">Analyses per day</p>
                  </div>
                </div>
                <select
                  value={preferences.dailyGoalTarget}
                  onChange={(e) =>
                    setPreference("dailyGoalTarget", parseInt(e.target.value))
                  }
                  className="bg-surface-2 border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Text-to-speech</p>
                    <p className="text-xs text-muted-foreground">Enable pronunciation audio</p>
                  </div>
                </div>
                <button
                  onClick={() => setPreference("enableTTS", !preferences.enableTTS)}
                  role="switch"
                  aria-checked={preferences.enableTTS}
                  className={cn(
                    "relative w-10 h-5 rounded-full transition-colors",
                    preferences.enableTTS ? "bg-primary" : "bg-surface-3"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-card transition-transform shadow-sm",
                      preferences.enableTTS && "translate-x-5"
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Languages className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Show translations</p>
                    <p className="text-xs text-muted-foreground">Display English translations</p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setPreference("showTranslations", !preferences.showTranslations)
                  }
                  role="switch"
                  aria-checked={preferences.showTranslations}
                  className={cn(
                    "relative w-10 h-5 rounded-full transition-colors",
                    preferences.showTranslations ? "bg-primary" : "bg-surface-3"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-card transition-transform shadow-sm",
                      preferences.showTranslations && "translate-x-5"
                    )}
                  />
                </button>
              </div>
            </div>
          </section>

          <div className="border-t border-border" />

          {/* Sign out */}
          <section>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4 text-destructive" />
                <p className="text-sm font-medium text-destructive">Sign out</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="text-destructive border-destructive/20 hover:bg-destructive/5"
              >
                Sign out
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
