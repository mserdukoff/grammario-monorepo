import * as React from "react"
import Link from "next/link"
import { Sparkles } from "lucide-react"
import { Button } from "./button"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-indigo-500" />
          <span className="hidden font-bold sm:inline-block">Grammario</span>
        </Link>
        <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
          <Link href="/#features" className="transition-colors hover:text-foreground/80 text-foreground/60">Features</Link>
          <Link href="/#pricing" className="transition-colors hover:text-foreground/80 text-foreground/60">Pricing</Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Link href="/app">
            <Button variant="default" size="sm">Launch App</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}




