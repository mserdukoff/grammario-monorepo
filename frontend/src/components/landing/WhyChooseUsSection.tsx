"use client"

import { Zap, Shield, Smile, BarChart } from "lucide-react"

const reasons = [
  {
    icon: Zap,
    title: "Instant Analysis",
    description: "Get grammatical breakdowns in milliseconds, not minutes."
  },
  {
    icon: Shield,
    title: "100% Accurate",
    description: "Powered by state-of-the-art NLP models for precision."
  },
  {
    icon: Smile,
    title: "User Friendly",
    description: "Complex linguistics made simple and intuitive for everyone."
  },
  {
    icon: BarChart,
    title: "Track Progress",
    description: "Visualize your learning journey with detailed stats."
  }
]

export function WhyChooseUsSection() {
  return (
    <section className="container py-12 md:py-24">
      <div className="text-center mb-16">
        <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">Why Choose Us</h2>
        <div className="h-1 w-20 bg-indigo-500 mx-auto rounded-full" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {reasons.map((reason, index) => (
          <div key={index} className="flex flex-col items-center text-center group">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-indigo-500 group-hover:scale-110 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/50 transition-all duration-300">
              <reason.icon className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">{reason.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {reason.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

