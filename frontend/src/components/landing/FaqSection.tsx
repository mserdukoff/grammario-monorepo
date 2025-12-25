"use client"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

const faqs = [
  {
    question: "How does the visual grammar analysis work?",
    answer: "We use advanced dependency parsing models trained on millions of sentences. The engine breaks down each sentence into its constituent tokens and maps the grammatical relationships between them, visualizing these as interactive directed graphs."
  },
  {
    question: "Which languages are supported?",
    answer: "Currently, we support English, Spanish, Italian, German, Russian, and Turkish. We are actively working on adding French, Portuguese, and Japanese in the next update."
  },
  {
    question: "Is this suitable for beginners?",
    answer: "Yes! While the 'Deep Learner' focus implies depth, visual aids actually make complex concepts easier to grasp for beginners. You can start with simple sentences and scale up to complex literature."
  },
  {
    question: "Can I use it on mobile?",
    answer: "Absolutely. Our platform is fully responsive and optimized for mobile devices, so you can practice your grammar analysis on the go."
  }
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="container py-12 md:py-24 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-12">
        <div className="md:w-1/3">
          <h2 className="font-heading text-3xl font-bold mb-4">FAQ Section</h2>
          <p className="text-muted-foreground">
            Reduce hesitation with smart answers. Common concerns addressed upfront.
          </p>
        </div>
        
        <div className="md:w-2/3 space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="border border-slate-800 rounded-lg bg-slate-900/30 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex items-center justify-between w-full p-4 text-left font-medium hover:bg-slate-800/50 transition-colors"
              >
                {faq.question}
                {openIndex === index ? (
                  <Minus className="h-4 w-4 text-indigo-500 shrink-0 ml-4" />
                ) : (
                  <Plus className="h-4 w-4 text-slate-500 shrink-0 ml-4" />
                )}
              </button>
              <div 
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  openIndex === index ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <div className="p-4 pt-0 text-slate-400 text-sm leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

