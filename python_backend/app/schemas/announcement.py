"""Announcement schemas for validation and serialization."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class AnnouncementBase(BaseModel):
    """Base announcement schema with common fields."""
    title: str = Field(..., min_length=2, max_length=255)
    content: str
    is_pinned: bool = False


class AnnouncementCreate(AnnouncementBase):
    """Schema for creating a new announcement."""
    course_id: int


class AnnouncementUpdate(BaseModel):
    """Schema for updating an announcement."""
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    content: Optional[str] = None
    is_pinned: Optional[bool] = None
    is_published: Optional[bool] = None


class AnnouncementResponse(AnnouncementBase):
    """Schema for announcement response."""
    id: int
    course_id: int
    author_id: int
    is_published: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class AnnouncementDetailResponse(AnnouncementResponse):
    """Detailed announcement response with author info and replies."""
    author_name: str
    author_email: str
    total_replies: int = 0
    replies: List['ReplyResponse'] = []


class ReplyBase(BaseModel):
    """Base reply schema."""
    content: str


class ReplyCreate(ReplyBase):
    """Schema for creating a reply."""
    announcement_id: int
    parent_reply_id: Optional[int] = None


class ReplyUpdate(BaseModel):
    """Schema for updating a reply."""
    content: Optional[str] = None


class ReplyResponse(ReplyBase):
    """Schema for reply response."""
    id: int
    announcement_id: int
    author_id: int
    parent_reply_id: Optional[int] = None
    is_edited: bool
    created_at: datetime
    updated_at: datetime
    author_name: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class AnnouncementsListResponse(BaseModel):
    """Schema for list of announcements response."""
    total: int
    announcements: List[AnnouncementResponse]
