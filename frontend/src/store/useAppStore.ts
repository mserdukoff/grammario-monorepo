import * as React from "react"
import { create } from "zustand"

interface AppState {
  isPro: boolean
  upgradeToPro: () => Promise<void>
}

export const useAppStore = create<AppState>((set) => ({
  isPro: false,
  upgradeToPro: async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    set({ isPro: true })
  },
}))




