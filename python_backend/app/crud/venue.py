"""
CRUD operations for Venue model
"""
from typing import Any, Dict, List, Optional, Union
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.venue import Venue
from app.schemas.venue import VenueCreate, VenueUpdate


class CRUDVenue(CRUDBase[Venue, VenueCreate, VenueUpdate]):
    def get_by_name(self, db: Session, *, name: str) -> Optional[Venue]:
        return db.query(Venue).filter(Venue.name == name).first()

    def get_by_building(
        self, db: Session, *, building: str, skip: int = 0, limit: int = 100
    ) -> List[Venue]:
        return (
            db.query(Venue)
            .filter(Venue.building == building)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_available_venues(
        self,
        db: Session,
        *,
        day_of_week: int,
        time_slot: str,
        capacity_required: Optional[int] = None,
        venue_type: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Venue]:
        from app.models.timetable import Timetable
        query = db.query(Venue)
        
        if capacity_required:
            query = query.filter(Venue.capacity >= capacity_required)
        if venue_type:
            query = query.filter(Venue.venue_type == venue_type)
        
        booked_venue_ids = (
            db.query(Timetable.venue_id)
            .filter(
                Timetable.day_of_week == day_of_week,
                Timetable.time_slot == time_slot
            )
            .subquery()
        )
        
        query = query.filter(~Venue.id.in_(booked_venue_ids))
        
        return query.offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in: VenueCreate) -> Venue:
        db_obj = Venue(
            name=obj_in.name,
            building=obj_in.building,
            floor=obj_in.floor,
            capacity=obj_in.capacity,
            venue_type=obj_in.venue_type,
            facilities=obj_in.facilities,
            is_active=obj_in.is_active if obj_in.is_active is not None else True,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


venue = CRUDVenue(Venue)
