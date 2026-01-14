"use client"

import { Check, Sparkles, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function PricingSection() {
  return (
    <section id="pricing" className="container py-12 md:py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent pointer-events-none" />

      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-12 relative z-10">
        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl font-bold">
          Simple, Transparent Pricing
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Currently in beta - enjoy full access while we build!
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl md:grid-cols-2 gap-6 relative z-10">
        {/* Free Plan - Currently Active */}
        <Card className="backdrop-blur-md bg-emerald-950/20 border-emerald-500/50 shadow-2xl shadow-emerald-500/10">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400 w-fit">
              CURRENT ACCESS
            </div>
            <CardTitle className="text-2xl font-bold">Beta Access</CardTitle>
            <CardDescription>Full features during beta</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center items-baseline mb-6">
              <span className="text-4xl font-bold text-foreground">Free</span>
              <span className="text-muted-foreground ml-2">during beta</span>
            </div>
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
                  <Check className="h-3 w-3 text-emerald-500" />
                </div>
                <span className="text-sm text-slate-300">Unlimited analyses</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
                  <Check className="h-3 w-3 text-emerald-500" />
                </div>
                <span className="text-sm text-slate-300">All 5 languages</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
                  <Check className="h-3 w-3 text-emerald-500" />
                </div>
                <span className="text-sm text-slate-300">AI-powered explanations</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
                  <Check className="h-3 w-3 text-emerald-500" />
                </div>
                <span className="text-sm text-slate-300">Streak & XP tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
                  <Check className="h-3 w-3 text-emerald-500" />
                </div>
                <span className="text-sm text-slate-300">Save favorites</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-4">
            <Button
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white"
              onClick={() => (window.location.href = "/app")}
            >
              Start Learning Free
            </Button>
          </CardFooter>
        </Card>

        {/* Pro Plan - Coming Soon */}
        <Card className="backdrop-blur-md bg-slate-900/50 border-slate-700 relative overflow-hidden opacity-75">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
          
          <CardHeader className="text-center pb-2 relative">
            <div className="mx-auto mb-2 rounded-full bg-slate-700 px-3 py-1 text-xs font-medium text-slate-400 w-fit flex items-center gap-1">
              <Clock className="w-3 h-3" />
              COMING SOON
            </div>
            <CardTitle className="text-2xl font-bold text-slate-400">Pro Scholar</CardTitle>
            <CardDescription>For the serious linguist</CardDescription>
          </CardHeader>
          <CardContent className="text-center relative">
            <div className="flex justify-center items-baseline mb-6">
              <span className="text-4xl font-bold text-slate-400">$5</span>
              <span className="text-muted-foreground ml-2">/month</span>
            </div>
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-700">
                  <Check className="h-3 w-3 text-slate-500" />
                </div>
                <span className="text-sm text-slate-500">Everything in Free</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-700">
                  <Check className="h-3 w-3 text-slate-500" />
                </div>
                <span className="text-sm text-slate-500">Vocabulary flashcards</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-700">
                  <Check className="h-3 w-3 text-slate-500" />
                </div>
                <span className="text-sm text-slate-500">Spaced repetition</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-700">
                  <Check className="h-3 w-3 text-slate-500" />
                </div>
                <span className="text-sm text-slate-500">Priority support</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-700">
                  <Check className="h-3 w-3 text-slate-500" />
                </div>
                <span className="text-sm text-slate-500">API access</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-4 relative">
            <Button
              variant="outline"
              className="w-full h-11 border-slate-700 text-slate-500"
              disabled
            >
              Coming Soon
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  )
}
