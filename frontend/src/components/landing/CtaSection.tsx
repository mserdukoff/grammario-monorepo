"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CtaSection() {
  return (
    <section className="border-t border-border">
      <div className="container max-w-screen-xl py-20 md:py-28">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="font-heading text-3xl md:text-4xl italic tracking-tight">
            Ready to see how language actually works?
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Pick a sentence in any of our five supported languages and watch it come apart — word by word, rule by rule.
          </p>
          <Link href="/app">
            <Button size="lg" className="h-12 px-8 text-base mt-2 transition-transform active:scale-[0.98]">
              Start analyzing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
