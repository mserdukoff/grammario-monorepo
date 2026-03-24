"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const LANGUAGES = [
  { flag: "🇮🇹", name: "Italian" },
  { flag: "🇪🇸", name: "Spanish" },
  { flag: "🇩🇪", name: "German" },
  { flag: "🇷🇺", name: "Russian" },
  { flag: "🇹🇷", name: "Turkish" },
]

export function HeroSection() {
  return (
    <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 lg:pt-32 lg:pb-40">
      <div className="container max-w-screen-xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] tracking-tight leading-[1.05] text-foreground italic animate-fade-in-up">
                See how language<br />
                actually works.
              </h1>
              <p className="max-w-lg text-lg text-muted-foreground leading-relaxed animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                Deconstruct any sentence into its grammatical DNA. Interactive dependency parsing, morphological breakdowns, and AI-powered explanations across five languages.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <Link href="/app">
                <Button size="lg" className="h-12 px-6 text-base transition-transform active:scale-[0.98]">
                  Start analyzing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-4 pt-2 animate-fade-in" style={{ animationDelay: "350ms" }}>
              <span className="text-sm text-muted-foreground">Available in</span>
              <div className="flex gap-2">
                {LANGUAGES.map((lang) => (
                  <span
                    key={lang.name}
                    className="text-lg"
                    title={lang.name}
                  >
                    {lang.flag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="relative lg:pl-8 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="border-b border-border px-5 py-3 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                </div>
                <span className="text-xs text-muted-foreground font-mono">Il gatto mangia il pesce.</span>
              </div>
              <div className="p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-center gap-3 md:gap-5 flex-wrap">
                  {[
                    { word: "Il", pos: "DET", color: "text-muted-foreground" },
                    { word: "gatto", pos: "NOUN", color: "text-foreground" },
                    { word: "mangia", pos: "VERB", color: "text-primary" },
                    { word: "il", pos: "DET", color: "text-muted-foreground" },
                    { word: "pesce", pos: "NOUN", color: "text-foreground" },
                  ].map((token, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <span className={`text-lg md:text-xl font-medium ${token.color}`}>{token.word}</span>
                      <span className="text-[11px] font-mono tracking-wide text-muted-foreground uppercase">{token.pos}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-5 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Translation:</span>{" "}
                    <span className="italic">The cat eats the fish.</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Key concept:</span>{" "}
                    Italian definite articles vary by gender. &ldquo;Il&rdquo; marks masculine singular nouns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
