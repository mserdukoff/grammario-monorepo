/**
 * Create Billing Portal Session API Route
 * 
 * Creates a Stripe Billing Portal session for subscription management.
 */
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Stripe from "stripe"

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-12-18.acacia" })
  : null

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: "payments_not_configured", message: "Billing portal coming soon" },
      { status: 503 }
    )
  }
  
  const supabase = await createClient()
  
  // Require authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: "unauthorized", message: "Authentication required" },
      { status: 401 }
    )
  }
  
  // Parse request
  let body: { return_url?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "Invalid JSON body" },
      { status: 400 }
    )
  }
  
  const { return_url } = body
  
  if (!return_url) {
    return NextResponse.json(
      { error: "invalid_input", message: "return_url is required" },
      { status: 400 }
    )
  }
  
  try {
    // Get customer ID from database
    const { data: profile } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single()
    
    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: "no_subscription", message: "No active subscription found" },
        { status: 400 }
      )
    }
    
    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url,
    })
    
    return NextResponse.json({
      portal_url: session.url,
    })
    
  } catch (error) {
    console.error("Stripe portal error:", error)
    return NextResponse.json(
      {
        error: "portal_failed",
        message: "Failed to create portal session. Please try again.",
      },
      { status: 500 }
    )
  }
}
