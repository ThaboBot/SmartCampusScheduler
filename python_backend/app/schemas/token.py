"""Token schemas for authentication."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class Token(BaseModel):
    """Token response schema."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    """Token refresh request schema."""
    refresh_token: str


class TokenData(BaseModel):
    """Token data extracted from JWT."""
    user_id: int
    token_type: str
    exp: datetime
    
    class Config:
        from_attributes = True
