/**
 * Stripe Webhook Handler
 * 
 * Handles Stripe webhook events for subscription management.
 */
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import Stripe from "stripe"

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-12-18.acacia" })
  : null

// Use service role for webhook (bypasses RLS)
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  : null

export async function POST(request: NextRequest) {
  if (!stripe || !supabaseAdmin) {
    return NextResponse.json(
      { error: "webhooks_not_configured" },
      { status: 503 }
    )
  }
  
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")
  
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "missing_signature" },
      { status: 400 }
    )
  }
  
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return NextResponse.json(
      { error: "invalid_signature" },
      { status: 400 }
    )
  }
  
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.supabase_user_id
        
        if (userId && session.subscription) {
          await supabaseAdmin
            .from("users")
            .update({
              is_pro: true,
              stripe_subscription_id: session.subscription as string,
              subscription_status: "active",
            })
            .eq("id", userId)
        }
        break
      }
      
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const status = subscription.status
        
        // Find user by customer ID
        const { data: user } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("stripe_customer_id", subscription.customer as string)
          .single()
        
        if (user) {
          await supabaseAdmin
            .from("users")
            .update({
              is_pro: status === "active" || status === "trialing",
              subscription_status: status,
              subscription_ends_at: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000).toISOString()
                : null,
            })
            .eq("id", user.id)
        }
        break
      }
      
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        
        // Find user by customer ID
        const { data: user } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("stripe_customer_id", subscription.customer as string)
          .single()
        
        if (user) {
          await supabaseAdmin
            .from("users")
            .update({
              is_pro: false,
              subscription_status: "canceled",
              stripe_subscription_id: null,
            })
            .eq("id", user.id)
        }
        break
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
    
    return NextResponse.json({ received: true })
    
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json(
      { error: "webhook_handler_failed" },
      { status: 500 }
    )
  }
}
