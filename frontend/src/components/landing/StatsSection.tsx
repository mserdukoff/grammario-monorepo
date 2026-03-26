"use client"

import { Languages, BookOpen, Zap, BrainCircuit } from "lucide-react"

const stats = [
  { icon: Languages, value: "5", label: "Languages supported" },
  { icon: BookOpen, value: "50+", label: "Grammar concepts explained" },
  { icon: Zap, value: "Real-time", label: "Dependency parsing" },
  { icon: BrainCircuit, value: "AI-powered", label: "Contextual explanations" },
]

export function StatsSection() {
  return (
    <section className="border-y border-border bg-surface-1">
      <div className="container max-w-screen-xl py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center gap-2">
              <stat.icon className="w-5 h-5 text-primary mb-1" />
              <p className="text-2xl md:text-3xl font-semibold tracking-tight">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
