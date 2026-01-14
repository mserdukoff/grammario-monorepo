"use client"

import Link from "next/link"
import { Sparkles, Github, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/50 backdrop-blur-sm">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Sparkles className="h-6 w-6 text-indigo-500" />
              <span className="font-bold text-lg">Grammario</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Visual grammar analysis for the serious language learner. Deconstruct sentences, 
              master grammar, achieve fluency.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <Link href="/#features" className="hover:text-slate-200 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-slate-200 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/app" className="hover:text-slate-200 transition-colors">
                  Launch App
                </Link>
              </li>
              <li>
                <span className="text-slate-500">API (Coming Soon)</span>
              </li>
            </ul>
          </div>

          {/* Languages */}
          <div>
            <h3 className="font-semibold mb-4">Languages</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>Italian 🇮🇹</li>
              <li>Spanish 🇪🇸</li>
              <li>German 🇩🇪</li>
              <li>Russian 🇷🇺</li>
              <li>Turkish 🇹🇷</li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <Link href="/privacy" className="hover:text-slate-200 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-slate-200 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-slate-200 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Grammario. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/mserdukoff/grammario"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com/grammario"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
