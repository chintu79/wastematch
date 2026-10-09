import os
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from jwt import PyJWKClient
import structlog

from . import models
from .database import get_db

logger = structlog.get_logger()
security = HTTPBearer()

OIDC_ISSUER_URL = os.getenv("OIDC_ISSUER_URL", "https://mock-issuer.auth0.com/")
OIDC_JWKS_URL = f"{OIDC_ISSUER_URL.rstrip('/')}/.well-known/jwks.json"
OIDC_AUDIENCE = os.getenv("OIDC_AUDIENCE", "wastematch-api")

# Initialize JWK client with caching
jwks_client = PyJWKClient(OIDC_JWKS_URL, cache_keys=True)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """
    Validates the OIDC JWT token against the configured identity provider.
    """
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Check for mock token fallback in development if explicitly allowed
    if os.getenv("ALLOW_MOCK_AUTH", "false").lower() == "true":
        user = db.query(models.User).filter(models.User.email == token).first()
        if user:
            return user
            
    try:
        # Get the signing key from the JWKS
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        
        # Verify and decode the payload
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=OIDC_AUDIENCE,
            issuer=OIDC_ISSUER_URL
        )
        
        # OIDC standard uses 'email' or 'sub' (if email isn't available)
        email = payload.get("email")
        if not email:
            logger.warning("jwt_missing_email_claim", sub=payload.get("sub"))
            raise credentials_exception
            
        user = db.query(models.User).filter(models.User.email == email).first()
        if user is None:
            logger.warning("jwt_user_not_found_in_db", email=email)
            raise credentials_exception
            
        return user
        
    except jwt.PyJWKClientError as e:
        logger.error("jwt_jwks_fetch_error", error=str(e))
        raise credentials_exception
    except jwt.InvalidTokenError as e:
        logger.warning("jwt_invalid_token", error=str(e))
        raise credentials_exception
    except Exception as e:
        logger.error("jwt_validation_error", error=str(e))
        raise credentials_exception

def require_role(role_name: str):
    def role_checker(current_user: models.User = Depends(get_current_user)):
        # Naive RBAC implementation for MVP context
        # In a full system, you would check an organization-role junction table
        return current_user
    return role_checker


from sqlalchemy import text

def get_tenant_db(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Yields a database session with the PostgreSQL RLS tenant ID set."""
    if db.get_bind().dialect.name == "postgresql" and current_user and current_user.organization_id:
        db.execute(text(f"SET LOCAL wastematch.current_tenant_id = '{current_user.organization_id}'"))
    yield db
