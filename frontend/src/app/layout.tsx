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
  title: "Grammario",
  description: "See how language actually works.",
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
    icon: "/logo-g.svg",
    shortcut: "/logo-g.svg",
    apple: "/logo-g.svg",
  },
  openGraph: {
    title: "Grammario",
    description: "See how language actually works.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grammario",
    description: "See how language actually works.",
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
