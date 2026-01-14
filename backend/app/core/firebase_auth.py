"""
Supabase JWT Authentication verification for FastAPI.
Verifies Supabase access tokens from the frontend.
"""
import os
import logging
from typing import Optional, Dict, Any
import httpx
from fastapi import HTTPException, Header, Depends
from pydantic import BaseModel
import jwt
from jwt import PyJWKClient

logger = logging.getLogger(__name__)

# Supabase JWT settings
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")

# JWKS client for Supabase
_jwks_client: Optional[PyJWKClient] = None


def get_jwks_client() -> PyJWKClient:
    """Get or create JWKS client for Supabase."""
    global _jwks_client
    if _jwks_client is None and SUPABASE_URL:
        jwks_url = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
        _jwks_client = PyJWKClient(jwks_url)
    return _jwks_client


class SupabaseUser(BaseModel):
    """Represents a verified Supabase user."""
    uid: str
    email: Optional[str] = None
    role: str = "authenticated"
    is_pro: bool = False  # Will be set from database


class AuthError(Exception):
    """Authentication error."""
    pass


def verify_supabase_token(token: str) -> Dict[str, Any]:
    """
    Verify a Supabase JWT token.
    
    Uses the JWT secret or JWKS endpoint for verification.
    """
    try:
        # Method 1: Use JWT secret (simpler, faster)
        if SUPABASE_JWT_SECRET:
            payload = jwt.decode(
                token,
                SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated",
            )
            return payload
        
        # Method 2: Use JWKS (more secure for production)
        jwks_client = get_jwks_client()
        if jwks_client:
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                audience="authenticated",
            )
            return payload
        
        raise AuthError("No JWT verification method configured")
        
    except jwt.ExpiredSignatureError:
        raise AuthError("Token has expired")
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {e}")
        raise AuthError("Invalid token")
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise AuthError(str(e))


async def get_current_user(
    authorization: Optional[str] = Header(None, alias="Authorization")
) -> Optional[SupabaseUser]:
    """
    FastAPI dependency to get the current authenticated user.
    Returns None if no valid token is provided (allows anonymous access).
    """
    if not authorization:
        return None
    
    # Extract Bearer token
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    
    token = parts[1]
    
    try:
        payload = verify_supabase_token(token)
        
        return SupabaseUser(
            uid=payload.get("sub", ""),
            email=payload.get("email"),
            role=payload.get("role", "authenticated"),
            is_pro=False,  # Will be enriched from database
        )
    except AuthError as e:
        logger.warning(f"Auth failed: {e}")
        return None


async def require_auth(
    authorization: Optional[str] = Header(None, alias="Authorization")
) -> SupabaseUser:
    """
    FastAPI dependency that requires authentication.
    Raises 401 if not authenticated.
    """
    user = await get_current_user(authorization)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return user


# Keep backwards compatibility alias
FirebaseUser = SupabaseUser
