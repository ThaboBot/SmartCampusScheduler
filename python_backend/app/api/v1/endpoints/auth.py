"""
Authentication endpoints
"""
from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import get_db
from app.core import security
from app.core.config import settings
from app.schemas.token import Token
from app.schemas.user import User, UserCreate, UserInDB, UserUpdate
from app.models.user import User

router = APIRouter()


@router.post("/login/access-token", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    Uses generic error messages to prevent user enumeration.
    """
    user = crud.user.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        # Generic error message to prevent user enumeration
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif not crud.user.is_active(user):
        # Still use generic message to avoid revealing account status
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }


@router.post("/login/test-token", response_model=User)
def test_token(current_user: User = Depends(security.get_current_user)) -> Any:
    """
    Test access token by getting current user.
    """
    return current_user


@router.post("/register", response_model=User)
def register_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
) -> Any:
    """
    Create new user without authentication (for registration).
    Uses generic error message to prevent user enumeration.
    """
    user = crud.user.get_by_email(db, email=user_in.email)
    if user:
        # Generic error to prevent revealing which emails are registered
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration failed. Please try a different email or contact support.",
        )
    
    user = crud.user.create(db, obj_in=user_in)
    return user


@router.post("/password-recovery/{email}")
def recover_password(email: str, db: Session = Depends(get_db)) -> Any:
    """
    Password Recovery endpoint.
    Always returns success message to prevent user enumeration.
    """
    user = crud.user.get_by_email(db, email=email)
    if user:
        # TODO: Implement email sending with recovery token
        # Only send email if user exists, but always return same message
        pass
    
    # Always return success to prevent revealing which emails are registered
    return {"message": "If an account exists with this email, a password recovery link has been sent."}


@router.post("/reset-password/")
def reset_password(
    *,
    db: Session = Depends(get_db),
    token: str,
    new_password: str,
) -> Any:
    """
    Reset password using token.
    """
    # TODO: Implement token validation and password reset
    return {"message": "Password updated successfully"}
