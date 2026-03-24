"use client"

import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import { HeroSection } from "@/components/landing/HeroSection"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { PricingSection } from "@/components/landing/PricingSection"
import { FaqSection } from "@/components/landing/FaqSection"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <FaqSection />
      </main>

      <Footer />
    </div>
  )
}
