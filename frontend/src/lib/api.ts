/**
 * API Client
 * 
 * Centralized API client with authentication support.
 * Uses Supabase session for auth headers.
 */
import axios, { AxiosError } from "axios"
import { getSupabaseClient } from "./supabase/client"

// Types for API responses
export interface AnalysisResponse {
  metadata: {
    text: string
    language: string
  }
  nodes: TokenNode[]
  pedagogical_data?: PedagogicalData
}

export interface TokenNode {
  id: number
  text: string
  lemma: string
  upos: string
  xpos?: string
  feats?: string
  head_id: number
  deprel: string
  misc?: string
  segments?: string[]
}

export interface GrammarConcept {
  name: string
  description: string
  related_words: string[]
}

export interface GrammarTip {
  word: string
  question: string
  explanation: string
  rule?: string
  examples?: string[]
}

export interface PedagogicalData {
  translation: string
  nuance?: string
  concepts: GrammarConcept[]
  tips?: GrammarTip[]
}

export interface UsageStats {
  used_today: number
  limit: number
  remaining: number
  reset_at: number
  is_pro: boolean
}

export interface Language {
  code: string
  name: string
  native_name: string
  family: string
  sample: string
}

// API Error type
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = "ApiError"
  }
}

// Create axios instance
const api = axios.create({
  baseURL: "/api/v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add auth interceptor
api.interceptors.request.use(async (config) => {
  const supabase = getSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string | { message?: string; error?: string } }>) => {
    let message = "An error occurred"
    
    if (error.response?.data?.detail) {
      if (typeof error.response.data.detail === "string") {
        message = error.response.data.detail
      } else if (error.response.data.detail.message) {
        message = error.response.data.detail.message
      }
    } else if (error.message) {
      message = error.message
    }

    throw new ApiError(
      message,
      error.response?.status || 500,
      error.response?.data as Record<string, unknown>
    )
  }
)

// API functions
export async function analyzeText(text: string, language: string): Promise<AnalysisResponse> {
  const response = await api.post<AnalysisResponse>("/analyze", { text, language })
  return response.data
}

export async function getUsage(): Promise<UsageStats> {
  const response = await api.get<UsageStats>("/usage")
  return response.data
}

export async function getLanguages(): Promise<{ languages: Language[] }> {
  const response = await api.get<{ languages: Language[] }>("/languages")
  return response.data
}

// Billing
export async function createCheckoutSession(successUrl: string, cancelUrl: string) {
  const response = await api.post<{ session_id: string; checkout_url: string }>(
    "/billing/create-checkout-session",
    { success_url: successUrl, cancel_url: cancelUrl }
  )
  return response.data
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  const response = await api.post<{ portal_url: string }>("/billing/create-portal-session", {
    customer_id: customerId,
    return_url: returnUrl,
  })
  return response.data
}

export default api
