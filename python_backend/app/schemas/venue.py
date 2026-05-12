"""Venue schemas for validation and serialization."""
from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field, ConfigDict


class VenueBase(BaseModel):
    """Base venue schema with common fields."""
    name: str = Field(..., min_length=2, max_length=100)
    code: str = Field(..., min_length=2, max_length=20)
    building: str = Field(..., min_length=2, max_length=100)
    floor: Optional[int] = Field(None, ge=0)
    room_number: Optional[str] = Field(None, max_length=20)
    capacity: int = Field(..., ge=1)
    venue_type: str = Field(default="classroom", max_length=50)
    description: Optional[str] = None
    facilities: Optional[List[str]] = None
    is_available: bool = True


class VenueCreate(VenueBase):
    """Schema for creating a new venue."""
    pass


class VenueUpdate(BaseModel):
    """Schema for updating a venue."""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    capacity: Optional[int] = Field(None, ge=1)
    venue_type: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    facilities: Optional[List[str]] = None
    is_available: Optional[bool] = None


class VenueResponse(VenueBase):
    """Schema for venue response."""
    id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class VenueDetailResponse(VenueResponse):
    """Detailed venue response with usage statistics."""
    total_scheduled_classes: int = 0
    availability_percentage: float = 0.0


class VenuesListResponse(BaseModel):
    """Schema for list of venues response."""
    total: int
    venues: List[VenueResponse]


class VenueAvailabilityRequest(BaseModel):
    """Schema for checking venue availability."""
    date: datetime
    start_time: str = Field(..., pattern=r'^\d{2}:\d{2}$')  # HH:MM format
    end_time: str = Field(..., pattern=r'^\d{2}:\d{2}$')  # HH:MM format
    capacity_required: Optional[int] = Field(None, ge=1)
    venue_type: Optional[str] = None
