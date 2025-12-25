"use client"

import Link from "next/link"
import { ArrowRight, Star, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LandingDemo } from "@/components/LandingDemo"

export function HeroSection() {
  return (
    <section className="relative pt-6 pb-12 md:pt-12 md:pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
      <div className="container flex flex-col lg:flex-row items-center gap-12">
        {/* Left Content */}
        <div className="flex-1 space-y-8 text-center lg:text-left z-20">
          <div className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-400 border border-indigo-500/20 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 mr-2 animate-pulse"></span>
            Version 1.0 is now live
            <ArrowRight className="ml-2 h-3 w-3" />
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
            Visual Grammar <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">
              For Deep Learners
            </span>
          </h1>

          <p className="max-w-[42rem] mx-auto lg:mx-0 leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Stop guessing. Start deconstructing. Analyze sentences in 5 languages with deterministic precision and interactive visualizations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link href="/app">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-white text-slate-950 hover:bg-slate-200 transition-all hover:scale-105">
                <Download className="mr-2 h-5 w-5" />
                Start Analyzing
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-slate-700 bg-slate-900/50 hover:bg-slate-800 backdrop-blur-sm transition-all hover:scale-105">
                How it Works
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Content - Mockup */}
        <div className="flex-1 w-full max-w-xl lg:max-w-none relative z-10">
           {/* We scale the demo down slightly on smaller screens or if it's too big, 
               but here we rely on container width. The Demo has fixed height, 
               so we might want to ensure it doesn't overflow weirdly. */}
          <div className="relative rounded-2xl border border-slate-800 bg-slate-950/50 backdrop-blur-sm p-2 shadow-2xl lg:ml-auto">
             <div className="rounded-xl overflow-hidden bg-slate-900 relative">
                <LandingDemo />
             </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        </div>
      </div>
    </section>
  )
}
