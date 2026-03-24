"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container max-w-screen-xl py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <img src="/logo-wordmark.svg" alt="Grammario" className="h-6" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Visual grammar analysis for the serious language learner.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-sm mb-4">Product</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/#features" className="hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/app" className="hover:text-foreground transition-colors">
                  Launch App
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-sm mb-4">Languages</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>Italian</li>
              <li>Spanish</li>
              <li>German</li>
              <li>Russian</li>
              <li>Turkish</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-sm mb-4">Legal</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Grammario
          </p>
        </div>
      </div>
    </footer>
  )
}
