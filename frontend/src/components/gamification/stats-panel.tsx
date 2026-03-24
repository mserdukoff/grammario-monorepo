"use client"

import { useAuth, xpProgress, xpForNextLevel, XP_PER_LEVEL } from "@/lib/auth-context"
import { Flame, Zap, Target, TrendingUp, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsPanelProps {
  dailyGoal?: { target: number; completed: number; is_achieved: boolean } | null
  className?: string
  compact?: boolean
}

export function StatsPanel({ dailyGoal, className, compact = false }: StatsPanelProps) {
  const { profile, profileLoading } = useAuth()

  if (profileLoading) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
      </div>
    )
  }

  if (!profile) return null

  const progress = xpProgress(profile.xp, profile.level)
  const xpNeeded = xpForNextLevel(profile.level)
  const currentLevelXp = XP_PER_LEVEL[profile.level - 1] || 0
  const xpIntoLevel = profile.xp - currentLevelXp

  if (compact) {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <div className="flex items-center gap-1.5">
          <Flame className={cn("w-4 h-4", profile.streak > 0 ? "text-warning" : "text-muted-foreground")} />
          <span className="text-sm font-medium">{profile.streak}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{profile.xp} XP</span>
        </div>
        {dailyGoal && (
          <div className="flex items-center gap-1.5">
            <Target className={cn("w-4 h-4", dailyGoal.is_achieved ? "text-success" : "text-muted-foreground")} />
            <span className="text-sm font-medium">{dailyGoal.completed}/{dailyGoal.target}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Level & XP */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Level {profile.level}</p>
          <p className="text-xs text-muted-foreground">{profile.xp} XP</p>
        </div>
        <div className="space-y-1">
          <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{xpIntoLevel} / {xpNeeded - currentLevelXp} XP</span>
            <span>Level {profile.level + 1}</span>
          </div>
        </div>
      </div>

      {/* Stats list */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Flame className={cn("w-4 h-4", profile.streak > 0 ? "text-warning" : "text-muted-foreground")} />
            <span className="text-sm">Streak</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium">{profile.streak} days</span>
            <p className="text-xs text-muted-foreground">Best: {profile.longest_streak}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Target className={cn("w-4 h-4", dailyGoal?.is_achieved ? "text-success" : "text-muted-foreground")} />
            <span className="text-sm">Today</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium">{dailyGoal?.completed || 0}/{dailyGoal?.target || 5}</span>
            {dailyGoal?.is_achieved ? (
              <p className="text-xs text-success">Done!</p>
            ) : (
              <p className="text-xs text-muted-foreground">{(dailyGoal?.target || 5) - (dailyGoal?.completed || 0)} to go</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm">Analyses</span>
          </div>
          <span className="text-sm font-medium">{profile.total_analyses}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Zap className={cn("w-4 h-4", profile.is_pro ? "text-warning" : "text-muted-foreground")} />
            <span className="text-sm">Plan</span>
          </div>
          <span className="text-sm font-medium">{profile.is_pro ? "Pro" : "Free"}</span>
        </div>
      </div>
    </div>
  )
}
