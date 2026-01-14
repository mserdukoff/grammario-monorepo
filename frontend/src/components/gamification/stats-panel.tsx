"use client"

/**
 * Stats Panel
 * 
 * Displays user gamification stats: XP, level, streak, daily goal.
 */
import { useAuth, xpProgress, xpForNextLevel, XP_PER_LEVEL } from "@/lib/auth-context"
import { Flame, Zap, Target, Trophy, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsPanelProps {
  dailyGoal?: { target: number; completed: number; is_achieved: boolean } | null
  className?: string
  compact?: boolean
}

export function StatsPanel({ dailyGoal, className, compact = false }: StatsPanelProps) {
  const { profile } = useAuth()

  if (!profile) return null

  const progress = xpProgress(profile.xp, profile.level)
  const xpNeeded = xpForNextLevel(profile.level)
  const currentLevelXp = XP_PER_LEVEL[profile.level - 1] || 0
  const xpIntoLevel = profile.xp - currentLevelXp

  if (compact) {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        {/* Streak */}
        <div className="flex items-center gap-1.5">
          <div className={cn(
            "p-1.5 rounded-lg",
            profile.streak > 0 ? "bg-orange-500/20" : "bg-slate-800"
          )}>
            <Flame className={cn(
              "w-4 h-4",
              profile.streak > 0 ? "text-orange-500" : "text-slate-500"
            )} />
          </div>
          <span className="text-sm font-medium">{profile.streak}</span>
        </div>

        {/* XP */}
        <div className="flex items-center gap-1.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/20">
            <Zap className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-sm font-medium">{profile.xp} XP</span>
        </div>

        {/* Daily Goal */}
        {dailyGoal && (
          <div className="flex items-center gap-1.5">
            <div className={cn(
              "p-1.5 rounded-lg",
              dailyGoal.is_achieved ? "bg-emerald-500/20" : "bg-slate-800"
            )}>
              <Target className={cn(
                "w-4 h-4",
                dailyGoal.is_achieved ? "text-emerald-500" : "text-slate-500"
              )} />
            </div>
            <span className="text-sm font-medium">
              {dailyGoal.completed}/{dailyGoal.target}
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Level & XP Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/20">
              <Trophy className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Level</p>
              <p className="text-xl font-bold">{profile.level}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total XP</p>
            <p className="text-lg font-semibold text-indigo-400">{profile.xp}</p>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{xpIntoLevel} / {xpNeeded - currentLevelXp} XP</span>
            <span>Level {profile.level + 1}</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Streak */}
        <div className={cn(
          "rounded-xl border p-4",
          profile.streak > 0
            ? "border-orange-500/30 bg-orange-950/20"
            : "border-slate-800 bg-slate-900/50"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <Flame className={cn(
              "w-5 h-5",
              profile.streak > 0 ? "text-orange-500" : "text-slate-500"
            )} />
            <span className="text-xs text-muted-foreground">Streak</span>
          </div>
          <p className="text-2xl font-bold">{profile.streak}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Best: {profile.longest_streak} days
          </p>
        </div>

        {/* Daily Goal */}
        <div className={cn(
          "rounded-xl border p-4",
          dailyGoal?.is_achieved
            ? "border-emerald-500/30 bg-emerald-950/20"
            : "border-slate-800 bg-slate-900/50"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <Target className={cn(
              "w-5 h-5",
              dailyGoal?.is_achieved ? "text-emerald-500" : "text-slate-500"
            )} />
            <span className="text-xs text-muted-foreground">Today</span>
          </div>
          <p className="text-2xl font-bold">
            {dailyGoal?.completed || 0}/{dailyGoal?.target || 5}
          </p>
          {dailyGoal?.is_achieved ? (
            <p className="text-xs text-emerald-400 mt-1">Goal achieved! 🎉</p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">
              {(dailyGoal?.target || 5) - (dailyGoal?.completed || 0)} to go
            </p>
          )}
        </div>

        {/* Total Analyses */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-cyan-500" />
            <span className="text-xs text-muted-foreground">Analyses</span>
          </div>
          <p className="text-2xl font-bold">{profile.total_analyses}</p>
          <p className="text-xs text-muted-foreground mt-1">Total sentences</p>
        </div>

        {/* Pro Status */}
        <div className={cn(
          "rounded-xl border p-4",
          profile.is_pro
            ? "border-amber-500/30 bg-amber-950/20"
            : "border-slate-800 bg-slate-900/50"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <Zap className={cn(
              "w-5 h-5",
              profile.is_pro ? "text-amber-500" : "text-slate-500"
            )} />
            <span className="text-xs text-muted-foreground">Plan</span>
          </div>
          <p className="text-xl font-bold">
            {profile.is_pro ? "Pro" : "Free"}
          </p>
          {!profile.is_pro && (
            <p className="text-xs text-muted-foreground mt-1">
              Upgrade for unlimited
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
