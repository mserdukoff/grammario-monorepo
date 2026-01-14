/**
 * Global Application State
 * 
 * Manages UI state, analysis history (in-memory), and user preferences.
 * Persistent user data is stored in Firestore via auth-context.
 */
import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AnalysisResponse } from "@/lib/api"

interface AppState {
  // UI State
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void

  // Current analysis session
  currentAnalysis: AnalysisResponse | null
  setCurrentAnalysis: (analysis: AnalysisResponse | null) => void

  // Recent analyses (session memory - persisted analyses are in Firestore)
  recentAnalyses: AnalysisResponse[]
  addRecentAnalysis: (analysis: AnalysisResponse) => void
  clearRecentAnalyses: () => void

  // User preferences
  preferences: {
    defaultLanguage: string
    dailyGoalTarget: number
    showTranslations: boolean
    enableSounds: boolean
    enableTTS: boolean
  }
  setPreference: <K extends keyof AppState["preferences"]>(
    key: K,
    value: AppState["preferences"][K]
  ) => void

  // Onboarding
  hasCompletedOnboarding: boolean
  setHasCompletedOnboarding: (completed: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // UI State
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Current analysis
      currentAnalysis: null,
      setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),

      // Recent analyses
      recentAnalyses: [],
      addRecentAnalysis: (analysis) =>
        set((state) => ({
          recentAnalyses: [analysis, ...state.recentAnalyses].slice(0, 10),
        })),
      clearRecentAnalyses: () => set({ recentAnalyses: [] }),

      // Preferences
      preferences: {
        defaultLanguage: "it",
        dailyGoalTarget: 5,
        showTranslations: true,
        enableSounds: true,
        enableTTS: true,
      },
      setPreference: (key, value) =>
        set((state) => ({
          preferences: { ...state.preferences, [key]: value },
        })),

      // Onboarding
      hasCompletedOnboarding: false,
      setHasCompletedOnboarding: (completed) =>
        set({ hasCompletedOnboarding: completed }),
    }),
    {
      name: "grammario-storage",
      partialize: (state) => ({
        preferences: state.preferences,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        recentAnalyses: state.recentAnalyses,
      }),
    }
  )
)
