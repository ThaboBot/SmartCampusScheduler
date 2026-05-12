"""Venue model definition."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON
from sqlalchemy.orm import relationship

from app.db.base import Base


class Venue(Base):
    """Venue model representing classrooms, lecture halls, and other facilities."""
    
    __tablename__ = "venues"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(20), unique=True, nullable=False, index=True)
    building = Column(String(100), nullable=False)
    floor = Column(Integer, nullable=True)
    room_number = Column(String(20), nullable=True)
    capacity = Column(Integer, nullable=False)
    venue_type = Column(String(50), default="classroom", nullable=False)  # classroom, lab, lecture_hall, etc.
    description = Column(Text, nullable=True)
    facilities = Column(JSON, default=list, nullable=True)  # [projector, whiteboard, computers, etc.]
    is_available = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    classes = relationship("ClassSchedule", back_populates="venue")
    venue_changes_original = relationship("VenueChange", back_populates="original_venue", foreign_keys="VenueChange.original_venue_id")
    venue_changes_new = relationship("VenueChange", back_populates="new_venue", foreign_keys="VenueChange.new_venue_id")
    
    def __repr__(self) -> str:
        return f"<Venue(id={self.id}, code={self.code}, name={self.name})>"
