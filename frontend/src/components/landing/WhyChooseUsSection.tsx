"use client"

import {
  Brain,
  Languages,
  GraduationCap,
  Trophy,
  Sparkles,
  Unlock,
} from "lucide-react"

const differentiators = [
  {
    icon: Brain,
    title: "Real linguistic parsing",
    description:
      "Powered by Stanza and spaCy — the same NLP engines used in academic research. Not pattern matching or regex tricks.",
  },
  {
    icon: Languages,
    title: "Five language families",
    description:
      "From Romance inflection to Turkic agglutination. Each language gets specialized handling for its unique grammar.",
  },
  {
    icon: GraduationCap,
    title: "AI that teaches, not just corrects",
    description:
      "Every analysis comes with contextual explanations, grammar concept breakdowns, and \"why is it this way?\" answers.",
  },
  {
    icon: Trophy,
    title: "Track your progress",
    description:
      "Earn XP, maintain streaks, hit daily goals, and review vocabulary with spaced repetition built in.",
  },
  {
    icon: Sparkles,
    title: "Built for curious learners",
    description:
      "Whether you're a beginner or advanced — dependency graphs make abstract grammar rules visual and concrete.",
  },
  {
    icon: Unlock,
    title: "Free to explore",
    description:
      "Core features are free. No paywall on sentence analysis, AI explanations, or vocabulary tracking.",
  },
]

export function WhyChooseUsSection() {
  return (
    <section className="container max-w-screen-xl py-20 md:py-28">
      <div className="max-w-2xl mb-16">
        <h2 className="font-heading text-3xl md:text-4xl italic tracking-tight mb-4">
          Why Grammario
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          A different kind of language tool — built on real linguistics, designed for real understanding.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
        {differentiators.map((item) => (
          <div key={item.title} className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <item.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
