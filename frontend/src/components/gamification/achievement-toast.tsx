"use client"

/**
 * Achievement Toast
 * 
 * Animated toast notification for achievement unlocks and level ups.
 */
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, Star, Flame, Zap } from "lucide-react"

interface AchievementToastProps {
  type: "achievement" | "level_up" | "streak" | "xp"
  title: string
  description: string
  icon?: string
  xp?: number
  isVisible: boolean
  onClose: () => void
}

export function AchievementToast({
  type,
  title,
  description,
  icon,
  xp,
  isVisible,
  onClose,
}: AchievementToastProps) {
  const getIcon = () => {
    if (icon) return <span className="text-2xl">{icon}</span>
    switch (type) {
      case "achievement":
        return <Trophy className="w-6 h-6 text-amber-400" />
      case "level_up":
        return <Star className="w-6 h-6 text-indigo-400" />
      case "streak":
        return <Flame className="w-6 h-6 text-orange-400" />
      case "xp":
        return <Zap className="w-6 h-6 text-cyan-400" />
    }
  }

  const getBgClass = () => {
    switch (type) {
      case "achievement":
        return "from-amber-950/90 to-amber-900/80 border-amber-500/30"
      case "level_up":
        return "from-indigo-950/90 to-indigo-900/80 border-indigo-500/30"
      case "streak":
        return "from-orange-950/90 to-orange-900/80 border-orange-500/30"
      case "xp":
        return "from-cyan-950/90 to-cyan-900/80 border-cyan-500/30"
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[100]"
          onClick={onClose}
        >
          <div
            className={`
              relative overflow-hidden rounded-2xl border backdrop-blur-xl
              bg-gradient-to-r ${getBgClass()}
              px-6 py-4 shadow-2xl cursor-pointer
              min-w-[300px] max-w-[400px]
            `}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

            <div className="relative flex items-center gap-4">
              <div className="shrink-0 p-3 rounded-xl bg-white/10">
                {getIcon()}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white">{title}</h3>
                <p className="text-sm text-white/70 truncate">{description}</p>
              </div>

              {xp && (
                <div className="shrink-0 flex items-center gap-1 px-3 py-1 rounded-full bg-white/10">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-bold text-white">+{xp}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Add shimmer animation to globals.css:
// @keyframes shimmer {
//   0% { transform: translateX(-100%); }
//   100% { transform: translateX(100%); }
// }
// .animate-shimmer { animation: shimmer 2s infinite; }
