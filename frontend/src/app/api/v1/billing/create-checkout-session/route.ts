/**
 * Create Checkout Session API Route
 * 
 * Creates a Stripe Checkout session for Pro subscription.
 */
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Stripe from "stripe"

// Initialize Stripe (will be undefined if key not set)
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-12-18.acacia" })
  : null

export async function POST(request: NextRequest) {
  // Check if Stripe is configured
  if (!stripe || !process.env.STRIPE_PRICE_ID) {
    return NextResponse.json(
      {
        error: "payments_not_configured",
        message: "Pro subscriptions coming soon! For now, enjoy unlimited access.",
      },
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
  let body: { success_url?: string; cancel_url?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "Invalid JSON body" },
      { status: 400 }
    )
  }
  
  const { success_url, cancel_url } = body
  
  if (!success_url || !cancel_url) {
    return NextResponse.json(
      { error: "invalid_input", message: "success_url and cancel_url are required" },
      { status: 400 }
    )
  }
  
  try {
    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from("users")
      .select("stripe_customer_id, email")
      .eq("id", user.id)
      .single()
    
    let customerId = profile?.stripe_customer_id
    
    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email || profile?.email,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id
      
      // Save customer ID to database
      await supabase
        .from("users")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id)
    }
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url,
      cancel_url,
      metadata: {
        supabase_user_id: user.id,
      },
    })
    
    return NextResponse.json({
      session_id: session.id,
      checkout_url: session.url,
    })
    
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json(
      {
        error: "checkout_failed",
        message: "Failed to create checkout session. Please try again.",
      },
      { status: 500 }
    )
  }
}
