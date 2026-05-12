"""Timetable and ClassSchedule model definitions."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from app.db.base import Base


class VenueChangeStatus(str, enum.Enum):
    """Venue change status enumeration."""
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    CANCELLED = "cancelled"


class TimetableUpload(Base):
    """Timetable upload tracking model."""
    
    __tablename__ = "timetable_uploads"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_rows = Column(Integer, default=0, nullable=False)
    processed_rows = Column(Integer, default=0, nullable=False)
    failed_rows = Column(Integer, default=0, nullable=False)
    status = Column(String(20), default="processing", nullable=False)  # processing, completed, failed
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    
    def __repr__(self) -> str:
        return f"<TimetableUpload(id={self.id}, filename={self.filename})>"


class ClassSchedule(Base):
    """Class schedule model representing scheduled classes."""
    
    __tablename__ = "class_schedules"
    
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    venue_id = Column(Integer, ForeignKey("venues.id"), nullable=False)
    day_of_week = Column(String(10), nullable=False)  # Monday, Tuesday, etc.
    start_time = Column(String(5), nullable=False)  # HH:MM format
    end_time = Column(String(5), nullable=False)  # HH:MM format
    week_number = Column(Integer, default=1, nullable=False)
    is_recurring = Column(Boolean, default=True, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    course = relationship("Course", back_populates="classes")
    venue = relationship("Venue", back_populates="classes")
    attendance_records = relationship("AttendanceRecord", back_populates="class_schedule", cascade="all, delete-orphan")
    qr_sessions = relationship("QRCodeSession", back_populates="class_schedule", cascade="all, delete-orphan")
    venue_changes = relationship("VenueChange", back_populates="class_schedule", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<ClassSchedule(id={self.id}, course_id={self.course_id}, day={self.day_of_week})>"


class VenueChange(Base):
    """Venue change model for tracking venue changes."""
    
    __tablename__ = "venue_changes"
    
    id = Column(Integer, primary_key=True, index=True)
    class_schedule_id = Column(Integer, ForeignKey("class_schedules.id"), nullable=False)
    original_venue_id = Column(Integer, ForeignKey("venues.id"), nullable=False)
    new_venue_id = Column(Integer, ForeignKey("venues.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(SQLEnum(VenueChangeStatus), default=VenueChangeStatus.PENDING, nullable=False)
    ai_suggestion = Column(Boolean, default=False, nullable=False)
    time_adjustment = Column(Integer, default=0, nullable=True)  # Minutes adjusted
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    class_schedule = relationship("ClassSchedule", back_populates="venue_changes")
    original_venue = relationship("Venue", back_populates="venue_changes_original", foreign_keys=[original_venue_id])
    new_venue = relationship("Venue", back_populates="venue_changes_new", foreign_keys=[new_venue_id])
    
    def __repr__(self) -> str:
        return f"<VenueChange(id={self.id}, class_id={self.class_schedule_id})>"
