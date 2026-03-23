"use client"

import { useRouter } from "next/navigation"
import {
  User,
  Bell,
  Volume2,
  Target,
  LogOut,
  ChevronLeft,
  Crown,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

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
    <div className="flex min-h-screen flex-col bg-slate-950 text-foreground">
      <AppNavbar />

      <main className="flex-1 container max-w-2xl py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account and preferences
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <section className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
              <User className="w-5 h-5 text-slate-400" />
              <h2 className="font-semibold">Profile</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name || "User"}
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
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

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800">
                <div className="text-center">
                  <p className="text-2xl font-bold">{profile?.total_analyses || 0}</p>
                  <p className="text-xs text-muted-foreground">Analyses</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{profile?.streak || 0}</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{profile?.level || 1}</p>
                  <p className="text-xs text-muted-foreground">Level</p>
                </div>
              </div>
            </div>
          </section>

          {/* Plan Section */}
          <section className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-emerald-500/20 flex items-center gap-3">
              <Crown className="w-5 h-5 text-emerald-400" />
              <h2 className="font-semibold text-emerald-300">Beta Access</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium">Full Access</p>
                    <p className="text-sm text-muted-foreground">
                      Enjoy unlimited features during beta
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium">
                  Active
                </div>
              </div>
            </div>
          </section>

          {/* Preferences Section */}
          <section className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
              <Bell className="w-5 h-5 text-slate-400" />
              <h2 className="font-semibold">Preferences</h2>
            </div>
            <div className="divide-y divide-slate-800">
              {/* Daily Goal */}
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="font-medium">Daily Goal</p>
                    <p className="text-sm text-muted-foreground">
                      Analyses to complete per day
                    </p>
                  </div>
                </div>
                <select
                  value={preferences.dailyGoalTarget}
                  onChange={(e) =>
                    setPreference("dailyGoalTarget", parseInt(e.target.value))
                  }
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                >
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
              </div>

              {/* TTS */}
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="font-medium">Text-to-Speech</p>
                    <p className="text-sm text-muted-foreground">
                      Enable pronunciation audio
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPreference("enableTTS", !preferences.enableTTS)}
                  className={cn(
                    "relative w-11 h-6 rounded-full transition-colors",
                    preferences.enableTTS ? "bg-indigo-600" : "bg-slate-700"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform",
                      preferences.enableTTS && "translate-x-5"
                    )}
                  />
                </button>
              </div>

              {/* Show Translations */}
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="font-medium">Show Translations</p>
                    <p className="text-sm text-muted-foreground">
                      Display English translations automatically
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setPreference("showTranslations", !preferences.showTranslations)
                  }
                  className={cn(
                    "relative w-11 h-6 rounded-full transition-colors",
                    preferences.showTranslations ? "bg-indigo-600" : "bg-slate-700"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform",
                      preferences.showTranslations && "translate-x-5"
                    )}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Sign Out */}
          <section className="rounded-xl border border-red-900/50 bg-red-950/20 overflow-hidden">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-red-400" />
                <div>
                  <p className="font-medium text-red-400">Sign Out</p>
                  <p className="text-sm text-red-400/60">
                    Sign out of your account
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="border-red-900 text-red-400 hover:bg-red-950 hover:text-red-300"
              >
                Sign Out
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
