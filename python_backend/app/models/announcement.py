"""Announcement and AnnouncementReply model definitions."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship

from app.db.base import Base


class Announcement(Base):
    """Announcement model for course announcements and discussions."""
    
    __tablename__ = "announcements"
    
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    is_pinned = Column(Boolean, default=False, nullable=False)
    is_published = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    course = relationship("Course", back_populates="announcements")
    replies = relationship("AnnouncementReply", back_populates="announcement", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<Announcement(id={self.id}, title={self.title})>"


class AnnouncementReply(Base):
    """Announcement reply model for threaded discussions."""
    
    __tablename__ = "announcement_replies"
    
    id = Column(Integer, primary_key=True, index=True)
    announcement_id = Column(Integer, ForeignKey("announcements.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    parent_reply_id = Column(Integer, ForeignKey("announcement_replies.id"), nullable=True)
    content = Column(Text, nullable=False)
    is_edited = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    announcement = relationship("Announcement", back_populates="replies")
    parent = relationship("AnnouncementReply", remote_side=[id], backref="replies")
    
    def __repr__(self) -> str:
        return f"<AnnouncementReply(id={self.id}, announcement_id={self.announcement_id})>"
