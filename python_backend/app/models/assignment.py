"""Assignment and AssignmentSubmission model definitions."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean, Float, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from app.db.base import Base


class SubmissionStatus(str, enum.Enum):
    """Assignment submission status enumeration."""
    PENDING = "pending"
    SUBMITTED = "submitted"
    LATE = "late"
    GRADED = "graded"
    RETURNED = "returned"


class Assignment(Base):
    """Assignment model for homework and coursework."""
    
    __tablename__ = "assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    instructions = Column(Text, nullable=True)
    due_date = Column(DateTime, nullable=False)
    max_score = Column(Float, default=100.0, nullable=False)
    weight_percentage = Column(Float, default=10.0, nullable=False)  # Weight in final grade
    allow_late_submission = Column(Boolean, default=True, nullable=False)
    late_penalty_percentage = Column(Float, default=10.0, nullable=True)
    is_published = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    course = relationship("Course", back_populates="assignments")
    submissions = relationship("AssignmentSubmission", back_populates="assignment", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<Assignment(id={self.id}, title={self.title})>"


class AssignmentSubmission(Base):
    """Assignment submission model for student submissions."""
    
    __tablename__ = "assignment_submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    submission_text = Column(Text, nullable=True)
    file_path = Column(String(500), nullable=True)
    submitted_at = Column(DateTime, nullable=True)
    status = Column(SQLEnum(SubmissionStatus), default=SubmissionStatus.PENDING, nullable=False)
    score = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)
    graded_at = Column(DateTime, nullable=True)
    graded_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_late = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("User", back_populates="submissions")
    
    def __repr__(self) -> str:
        return f"<AssignmentSubmission(id={self.id}, assignment_id={self.assignment_id}, student_id={self.student_id})>"
