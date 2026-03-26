"use client"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

const faqs = [
  {
    question: "How does the grammar analysis work?",
    answer: "We use dependency parsing models (spaCy / Stanza) trained on millions of sentences. The engine breaks each sentence into tokens and maps the grammatical relationships between them, which we then visualize as interactive directed graphs."
  },
  {
    question: "Which languages are supported?",
    answer: "Italian, Spanish, German, Russian, and Turkish. Each language has specialized handling for its unique grammar patterns — case systems, agglutination, gender agreement, and more."
  },
  {
    question: "Is this suitable for beginners?",
    answer: "Yes. Visual dependency graphs make abstract grammar rules concrete. Start with simple sentences and gradually work up to complex structures. The AI teacher explains every concept in plain English."
  },
  {
    question: "Can I use it on mobile?",
    answer: "The platform is fully responsive. The dependency graph adapts to smaller screens, and the analysis interface works well on touch devices."
  },
  {
    question: "Is my data private?",
    answer: "Yes. Your analyses are stored securely in your account and are never shared with third parties. You can delete any saved analysis at any time."
  },
  {
    question: "How is this different from Google Translate?",
    answer: "Google Translate gives you a translation. Grammario gives you a structural breakdown — dependency relations, morphological features, case governance, and AI-generated explanations of why the grammar works the way it does. It's a learning tool, not just a translation tool."
  },
  {
    question: "Will more languages be added?",
    answer: "Yes. We're actively working on expanding language support. Each new language requires specialized handling for its grammar patterns, so we add them carefully to ensure quality."
  }
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="border-t border-border bg-surface-1">
      <div className="container max-w-screen-xl py-20 md:py-28">
        <div className="flex flex-col md:flex-row gap-12 max-w-4xl">
          <div className="md:w-1/3 shrink-0">
            <h2 className="font-heading text-3xl md:text-4xl italic tracking-tight mb-4">Questions</h2>
            <p className="text-muted-foreground">
              Common questions about Grammario, answered.
            </p>
          </div>

          <div className="md:w-2/3 space-y-2">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border-b border-border"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="flex items-center justify-between w-full py-5 text-left font-medium transition-colors hover:text-primary"
                >
                  {faq.question}
                  {openIndex === index ? (
                    <Minus className="h-4 w-4 text-primary shrink-0 ml-4" />
                  ) : (
                    <Plus className="h-4 w-4 text-muted-foreground shrink-0 ml-4" />
                  )}
                </button>
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300",
                    openIndex === index ? "max-h-64 opacity-100 pb-5" : "max-h-0 opacity-0"
                  )}
                  style={{ transitionTimingFunction: "var(--ease-out-quart)" }}
                >
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
