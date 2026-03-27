"use client"

import Link from "next/link"
import { ArrowRight, FlaskConical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroDemoAnalysis } from "./HeroDemoAnalysis"

const LANGUAGES = [
  { flag: "🇮🇹", name: "Italian" },
  { flag: "🇪🇸", name: "Spanish" },
  { flag: "🇩🇪", name: "German" },
  { flag: "🇷🇺", name: "Russian" },
  { flag: "🇹🇷", name: "Turkish" },
]

export function HeroSection() {
  return (
    <section className="relative pt-0 pb-20 md:pb-32 lg:pb-40">
      <div className="w-full bg-primary/5 border-b border-primary/10 py-2.5 px-4 mb-16 md:mb-24 lg:mb-32">
        <p className="text-center text-sm text-primary flex items-center justify-center gap-2">
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Grammario is entering its testing phase — features and daily limits are subject to change.</span>
        </p>
      </div>
      <div className="container max-w-screen-xl">
        <div className="text-center space-y-8 mb-16 md:mb-20">
          <div className="space-y-4">
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] tracking-tight leading-[1.05] text-foreground italic animate-fade-in-up">
              See how language<br />
              actually works.
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              Deconstruct any sentence into its grammatical DNA. Interactive dependency parsing, morphological breakdowns, and AI-powered explanations across five languages.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <Link href="/app">
              <Button size="lg" className="h-12 px-6 text-base transition-transform active:scale-[0.98]">
                Start analyzing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-4 justify-center animate-fade-in" style={{ animationDelay: "350ms" }}>
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

        <div className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <HeroDemoAnalysis />
        </div>
      </div>
    </section>
  )
}
