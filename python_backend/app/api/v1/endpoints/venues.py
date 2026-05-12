"""
Venues endpoints
"""
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.schemas.venue import Venue as VenueSchema, VenueCreate, VenueUpdate

router = APIRouter()


@router.get("/", response_model=List[VenueSchema])
def read_venues(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve all venues.
    """
    venues = crud.venue.get_multi(db, skip=skip, limit=limit)
    return venues


@router.post("/", response_model=VenueSchema)
def create_venue(
    *,
    db: Session = Depends(get_db),
    venue_in: VenueCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Create new venue (admin only).
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    venue = crud.venue.create(db, obj_in=venue_in)
    return venue


@router.get("/{venue_id}", response_model=VenueSchema)
def read_venue(
    venue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get venue by ID.
    """
    venue = crud.venue.get(db, id=venue_id)
    if not venue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Venue not found",
        )
    return venue


@router.patch("/{venue_id}", response_model=VenueSchema)
def update_venue(
    *,
    db: Session = Depends(get_db),
    venue_id: int,
    venue_in: VenueUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update venue (admin only).
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    venue = crud.venue.get(db, id=venue_id)
    if not venue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Venue not found",
        )
    
    venue = crud.venue.update(db, db_obj=venue, obj_in=venue_in)
    return venue


@router.delete("/{venue_id}", response_model=VenueSchema)
def delete_venue(
    venue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Delete venue (admin only).
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    venue = crud.venue.get(db, id=venue_id)
    if not venue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Venue not found",
        )
    
    venue = crud.venue.remove(db, id=venue_id)
    return venue


@router.get("/available/")
def get_available_venues(
    day_of_week: int,
    time_slot: str,
    capacity_required: int = None,
    venue_type: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get available venues for a specific time slot.
    """
    venues = crud.venue.get_available_venues(
        db,
        day_of_week=day_of_week,
        time_slot=time_slot,
        capacity_required=capacity_required,
        venue_type=venue_type,
        skip=skip,
        limit=limit,
    )
    return venues
