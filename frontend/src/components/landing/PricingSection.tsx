"use client"

import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PricingSection() {
  return (
    <section id="pricing" className="container max-w-screen-xl py-20 md:py-28">
      <div className="max-w-2xl mb-12">
        <h2 className="font-heading text-3xl md:text-4xl italic tracking-tight mb-4">
          Simple pricing
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Grammario is in its testing phase. Enjoy full access to every feature while we build — daily limits are likely to change as we scale.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl">
        <div className="rounded-lg border-2 border-primary/20 bg-card p-8 space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-primary mb-2">Current access</p>
            <p className="text-3xl font-semibold">Free</p>
            <p className="text-sm text-muted-foreground mt-1">During testing phase</p>
          </div>

          <ul className="space-y-3">
            {[
              "3 analyses per day",
              "All 5 languages",
              "AI-powered explanations",
              "Streak & XP tracking",
              "Vocabulary review (SRS)",
              "Save favorites",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm">
                <Check className="w-4 h-4 text-success shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          <Button
            className="w-full"
            onClick={() => (window.location.href = "/app")}
          >
            Start learning free
          </Button>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-8 space-y-6 opacity-60">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Coming soon</p>
            <p className="text-3xl font-semibold">$5<span className="text-base font-normal text-muted-foreground">/mo</span></p>
            <p className="text-sm text-muted-foreground mt-1">For the serious linguist</p>
          </div>

          <ul className="space-y-3">
            {[
              "Everything in Free",
              "Vocabulary flashcards",
              "Spaced repetition",
              "Priority support",
              "API access",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm text-muted-foreground">
                <Check className="w-4 h-4 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          <Button variant="outline" className="w-full" disabled>
            Coming soon
          </Button>
        </div>
      </div>
    </section>
  )
}
