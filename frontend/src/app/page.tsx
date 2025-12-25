"use client"

import { Navbar } from "@/components/ui/navbar"
import { HeroSection } from "@/components/landing/HeroSection"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { WhyChooseUsSection } from "@/components/landing/WhyChooseUsSection"
import { PricingSection } from "@/components/landing/PricingSection"
import { FaqSection } from "@/components/landing/FaqSection"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-foreground relative overflow-hidden">
      {/* Background Gradient/Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 z-[-2] h-screen w-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

      <Navbar />
      
      <main className="flex-1 relative z-10">
        <HeroSection />
        <FeaturesSection />
        <WhyChooseUsSection />
        <PricingSection />
        <FaqSection />
      </main>
    </div>
  )
}
