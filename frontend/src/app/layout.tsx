import type { Metadata } from "next"
import { Space_Grotesk, JetBrains_Mono } from "next/font/google"
import { Providers } from "@/components/providers"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Grammario - Visual Grammar for Deep Learners",
  description:
    "Deconstruct sentences with AI-powered linguistic analysis. Master grammar in Italian, Spanish, German, Russian, and Turkish through interactive visualizations.",
  keywords: [
    "language learning",
    "grammar",
    "NLP",
    "linguistics",
    "Italian",
    "Spanish",
    "German",
    "Russian",
    "Turkish",
  ],
  authors: [{ name: "Grammario" }],
  openGraph: {
    title: "Grammario - Visual Grammar for Deep Learners",
    description: "Deconstruct sentences with AI-powered linguistic analysis.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grammario - Visual Grammar for Deep Learners",
    description: "Deconstruct sentences with AI-powered linguistic analysis.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
