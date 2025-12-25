"use client"

import { useState } from "react"
import { Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore } from "@/store/useAppStore"
import { cn } from "@/lib/utils"

export function PricingSection() {
  const { isPro, upgradeToPro } = useAppStore()
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)
    await upgradeToPro()
    setLoading(false)
  }

  return (
    <section id="pricing" className="container py-12 md:py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent pointer-events-none" />
      
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
  )
}

