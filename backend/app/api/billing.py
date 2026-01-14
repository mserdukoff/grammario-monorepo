"""
Billing API routes for Stripe subscription management.
Currently a placeholder - Stripe integration coming soon.
"""
import logging
from fastapi import APIRouter, HTTPException, Depends, Request, Header
from pydantic import BaseModel
from typing import Optional
from app.core.firebase_auth import require_auth, FirebaseUser
from app.core.config import settings

router = APIRouter(tags=["billing"])
logger = logging.getLogger(__name__)


class CheckoutRequest(BaseModel):
    """Request body for creating checkout session."""
    success_url: str
    cancel_url: str


class CheckoutResponse(BaseModel):
    """Response from checkout session creation."""
    session_id: str
    checkout_url: str


class PortalRequest(BaseModel):
    """Request body for billing portal."""
    return_url: str
    customer_id: str


@router.post("/create-checkout-session", response_model=CheckoutResponse)
async def create_checkout_session(
    request: CheckoutRequest,
    user: FirebaseUser = Depends(require_auth)
):
    """
    Create a Stripe Checkout session for Pro subscription.
    Currently disabled - payments coming soon.
    """
    # Stripe not configured yet - return friendly message
    raise HTTPException(
        status_code=503,
        detail={
            "error": "payments_not_configured", 
            "message": "Pro subscriptions coming soon! For now, enjoy unlimited access."
        }
    )


@router.post("/create-portal-session")
async def create_portal_session(
    request: PortalRequest,
    user: FirebaseUser = Depends(require_auth)
):
    """
    Create a Stripe Billing Portal session.
    Currently disabled - payments coming soon.
    """
    raise HTTPException(
        status_code=503,
        detail="Billing portal coming soon"
    )


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Handle Stripe webhook events.
    Currently disabled - will be implemented with Stripe integration.
    """
    return {"status": "webhooks_not_configured"}
