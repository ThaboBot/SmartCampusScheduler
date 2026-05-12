"""Notification model definition."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from app.db.base import Base


class NotificationType(str, enum.Enum):
    """Notification type enumeration."""
    GENERAL = "general"
    VENUE_CHANGE = "venue_change"
    ASSIGNMENT_DUE = "assignment_due"
    GRADE_PUBLISHED = "grade_published"
    ANNOUNCEMENT = "announcement"
    REMINDER = "reminder"


class Notification(Base):
    """Notification model for user notifications."""
    
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(SQLEnum(NotificationType), default=NotificationType.GENERAL, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    read_at = Column(DateTime, nullable=True)
    action_url = Column(String(500), nullable=True)  # Optional URL for action
    metadata = Column(Text, nullable=True)  # JSON string for additional data
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="notifications")
    
    def __repr__(self) -> str:
        return f"<Notification(id={self.id}, user_id={self.user_id}, title={self.title})>"
