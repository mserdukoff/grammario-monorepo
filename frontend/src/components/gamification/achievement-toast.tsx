"use client"

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
    if (icon) return <span className="text-xl">{icon}</span>
    switch (type) {
      case "achievement":
        return <Trophy className="w-5 h-5 text-warning" />
      case "level_up":
        return <Star className="w-5 h-5 text-primary" />
      case "streak":
        return <Flame className="w-5 h-5 text-warning" />
      case "xp":
        return <Zap className="w-5 h-5 text-primary" />
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[100]"
          onClick={onClose}
        >
          <div className="rounded-lg border border-border bg-card px-5 py-3 shadow-lg cursor-pointer min-w-[260px] max-w-[360px]">
            <div className="flex items-center gap-3">
              <div className="shrink-0 p-2 rounded-md bg-surface-2">
                {getIcon()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm">{title}</h3>
                <p className="text-xs text-muted-foreground truncate">{description}</p>
              </div>
              {xp !== undefined && xp > 0 && (
                <div className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium text-primary">+{xp}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
