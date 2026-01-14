/**
 * Languages API Route
 * 
 * Returns the list of supported languages.
 * This is static data, no auth required.
 */
import { NextResponse } from "next/server"

const SUPPORTED_LANGUAGES = [
  {
    code: "it",
    name: "Italian",
    native_name: "Italiano",
    family: "Romance",
    sample: "Il gatto mangia il pesce.",
  },
  {
    code: "es",
    name: "Spanish",
    native_name: "Español",
    family: "Romance",
    sample: "El gato come el pescado.",
  },
  {
    code: "de",
    name: "German",
    native_name: "Deutsch",
    family: "Germanic",
    sample: "Die Katze frisst den Fisch.",
  },
  {
    code: "ru",
    name: "Russian",
    native_name: "Русский",
    family: "Slavic",
    sample: "Кошка ест рыбу.",
  },
  {
    code: "tr",
    name: "Turkish",
    native_name: "Türkçe",
    family: "Turkic",
    sample: "Kedi balığı yiyor.",
  },
]

export async function GET() {
  return NextResponse.json({ languages: SUPPORTED_LANGUAGES })
}
