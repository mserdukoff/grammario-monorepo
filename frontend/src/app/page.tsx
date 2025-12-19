"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, ArrowRight, Zap, Globe, Layers, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import { useAppStore } from "@/store/useAppStore"
import { cn } from "@/lib/utils"

import { LandingDemo } from "@/components/LandingDemo"

export default function Home() {
  const { isPro, upgradeToPro } = useAppStore()
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)
    await upgradeToPro()
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-foreground relative overflow-hidden">
      {/* Background Gradient/Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 z-[-2] h-screen w-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

      <Navbar />
      
      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <div className="inline-flex items-center rounded-lg bg-muted/50 px-3 py-1 text-sm font-medium backdrop-blur-sm border border-border/50">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 mr-2 animate-pulse"></span>
              v1.0 is now live
            </div>
            
            <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight">
              Visual Grammar <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">
                For Deep Learners
              </span>
            </h1>
            
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Stop guessing. Start deconstructing. Analyze sentences in 5 languages with deterministic precision and interactive visualizations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link href="/app">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 shadow-lg shadow-indigo-500/20 border-0 transition-all hover:scale-105">
                  Start Analyzing <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-slate-700 bg-slate-900/50 hover:bg-slate-800 backdrop-blur-sm transition-all hover:scale-105">
                  How it Works
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container py-8 md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-16">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl font-bold">
              Linguistic DNA Deconstructed
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Different language families require different analytical strategies. We've built specific engines for each.
            </p>
          </div>
          
          <div className="mx-auto grid justify-center gap-8 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3 mb-20">
            <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm transition-all hover:bg-slate-900/60 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 group">
              <CardHeader>
                <div className="mb-4 inline-block rounded-lg bg-indigo-500/10 p-3 text-indigo-400 group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all w-fit">
                  <Sparkles className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl text-indigo-300">Romance</CardTitle>
                <CardDescription>Italian & Spanish</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400">Master clitics, multi-word token expansion, and complex gender/number agreement chains.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm transition-all hover:bg-slate-900/60 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10 group">
              <CardHeader>
                <div className="mb-4 inline-block rounded-lg bg-cyan-500/10 p-3 text-cyan-400 group-hover:bg-cyan-500/20 group-hover:scale-110 transition-all w-fit">
                  <Globe className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl text-cyan-300">Inflection</CardTitle>
                <CardDescription>German & Russian</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400">Visualize case governance (Nom, Acc, Dat, Gen), separable verbs, and perfective/imperfective aspect.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm transition-all hover:bg-slate-900/60 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 group">
              <CardHeader>
                <div className="mb-4 inline-block rounded-lg bg-emerald-500/10 p-3 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all w-fit">
                  <Layers className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl text-emerald-300">Agglutinative</CardTitle>
                <CardDescription>Turkish</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400">X-Ray vision for suffix chains. See exactly how <code>evlerinizden</code> breaks down into parts.</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 mb-20">
             <div className="flex items-center justify-center mb-6 px-2">
                <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Zap className="w-6 h-6 text-indigo-500" />
                  Live Examples
                </h3>
             </div>
            <LandingDemo />
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="container py-8 md:py-12 lg:py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/20 to-transparent pointer-events-none" />
          
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-12 relative z-10">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl font-bold">
              Simple, Transparent Pricing
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              One cup of coffee a month to unlock linguistic superpowers.
            </p>
          </div>
          
          <div className="mx-auto grid max-w-sm place-items-center relative z-10">
             <Card className={cn(
               "w-full backdrop-blur-md transition-all duration-300", 
               isPro 
                 ? "bg-emerald-950/30 border-emerald-500/50 shadow-2xl shadow-emerald-500/20" 
                 : "bg-slate-900/50 border-slate-700 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/20"
             )}>
              <CardHeader className="text-center pb-2">
                {isPro && <div className="mx-auto mb-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400 w-fit">CURRENT PLAN</div>}
                <CardTitle className="text-3xl font-bold">Pro Scholar</CardTitle>
                <CardDescription>For the serious linguist</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex justify-center items-baseline mb-6">
                  <span className="text-5xl font-bold text-foreground">$5</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
                      <Check className="h-4 w-4 text-emerald-500" />
                    </div>
                    <span className="text-sm text-slate-300">Unlimited Daily Analyses</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
                      <Check className="h-4 w-4 text-emerald-500" />
                    </div>
                    <span className="text-sm text-slate-300">Advanced Morphological Data</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
                      <Check className="h-4 w-4 text-emerald-500" />
                    </div>
                    <span className="text-sm text-slate-300">Priority Processing</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-6">
                <Button 
                  className={cn(
                    "w-full h-12 text-lg font-medium transition-all", 
                    isPro 
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-default" 
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                  )} 
                  size="lg"
                  onClick={handleSubscribe}
                  disabled={loading || isPro}
                >
                  {loading ? (
                    <>Processing <Sparkles className="ml-2 h-4 w-4 animate-spin" /></>
                  ) : isPro ? (
                    <>Active Plan <Check className="ml-2 h-4 w-4" /></>
                  ) : (
                    "Subscribe Now"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
