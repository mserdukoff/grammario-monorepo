"""
Stripe integration for subscription management.
Handles checkout sessions and webhook events.
"""
import os
import logging
from typing import Optional, Dict, Any
from datetime import datetime
import stripe
from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


class StripeService:
    """Handles Stripe subscription operations."""
    
    def __init__(self):
        self.price_id = settings.STRIPE_PRICE_ID
        self.webhook_secret = settings.STRIPE_WEBHOOK_SECRET
    
    def create_checkout_session(
        self,
        user_id: str,
        user_email: str,
        success_url: str,
        cancel_url: str
    ) -> Dict[str, Any]:
        """
        Create a Stripe Checkout session for subscription.
        
        Returns:
            Dict with session_id and checkout_url
        """
        if not stripe.api_key:
            raise ValueError("Stripe is not configured")
        
        if not self.price_id:
            raise ValueError("Stripe Price ID not configured")
        
        try:
            session = stripe.checkout.Session.create(
                mode="subscription",
                payment_method_types=["card"],
                line_items=[{
                    "price": self.price_id,
                    "quantity": 1,
                }],
                success_url=success_url,
                cancel_url=cancel_url,
                customer_email=user_email,
                metadata={
                    "user_id": user_id,
                },
                subscription_data={
                    "metadata": {
                        "user_id": user_id,
                    }
                },
                allow_promotion_codes=True,
            )
            
            return {
                "session_id": session.id,
                "checkout_url": session.url
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe checkout error: {e}")
            raise
    
    def create_billing_portal_session(
        self,
        customer_id: str,
        return_url: str
    ) -> str:
        """
        Create a Stripe Billing Portal session for subscription management.
        
        Returns:
            Portal URL
        """
        if not stripe.api_key:
            raise ValueError("Stripe is not configured")
        
        try:
            session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=return_url,
            )
            return session.url
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe portal error: {e}")
            raise
    
    def verify_webhook_signature(
        self,
        payload: bytes,
        signature: str
    ) -> Dict[str, Any]:
        """
        Verify and parse a Stripe webhook event.
        
        Returns:
            The verified event object
        """
        if not self.webhook_secret:
            raise ValueError("Webhook secret not configured")
        
        try:
            event = stripe.Webhook.construct_event(
                payload,
                signature,
                self.webhook_secret
            )
            return event
            
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Webhook signature verification failed: {e}")
            raise
    
    def get_subscription_status(self, subscription_id: str) -> Dict[str, Any]:
        """Get the current status of a subscription."""
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            return {
                "id": subscription.id,
                "status": subscription.status,
                "current_period_end": datetime.fromtimestamp(
                    subscription.current_period_end
                ).isoformat(),
                "cancel_at_period_end": subscription.cancel_at_period_end,
            }
        except stripe.error.StripeError as e:
            logger.error(f"Error fetching subscription: {e}")
            raise
    
    def cancel_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """Cancel a subscription at the end of the current period."""
        try:
            subscription = stripe.Subscription.modify(
                subscription_id,
                cancel_at_period_end=True
            )
            return {
                "id": subscription.id,
                "status": subscription.status,
                "cancel_at_period_end": subscription.cancel_at_period_end,
            }
        except stripe.error.StripeError as e:
            logger.error(f"Error canceling subscription: {e}")
            raise


# Global instance
stripe_service = StripeService()
