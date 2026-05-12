"""Notification schemas for validation and serialization."""
from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field, ConfigDict


class NotificationResponse(BaseModel):
    """Schema for notification response."""
    id: int
    user_id: int
    title: str
    message: str
    notification_type: str
    is_read: bool
    read_at: Optional[datetime] = None
    action_url: Optional[str] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class NotificationsListResponse(BaseModel):
    """Schema for list of notifications response."""
    total: int
    unread_count: int
    notifications: List[NotificationResponse]


class NotificationCreate(BaseModel):
    """Schema for creating a notification (internal use)."""
    user_id: int
    title: str = Field(..., min_length=1, max_length=255)
    message: str
    notification_type: str = "general"
    action_url: Optional[str] = None
    metadata: Optional[dict] = None
