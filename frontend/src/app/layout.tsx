import type { Metadata } from "next"
import { Plus_Jakarta_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google"
import { Providers } from "@/components/providers"
import "./globals.css"

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
})

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
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
    "Deconstruct sentences with linguistic analysis. Master grammar in Italian, Spanish, German, Russian, and Turkish through interactive visualizations.",
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
  icons: {
    icon: "/G Logo Max.png",
    shortcut: "/G Logo Max.png",
    apple: "/G Logo Max.png",
  },
  openGraph: {
    title: "Grammario - Visual Grammar for Deep Learners",
    description: "Deconstruct sentences with linguistic analysis.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grammario - Visual Grammar for Deep Learners",
    description: "Deconstruct sentences with linguistic analysis.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} ${plusJakarta.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
