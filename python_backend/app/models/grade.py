"""Grade model definition."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.base import Base


class Grade(Base):
    """Grade model for student course grades."""
    
    __tablename__ = "grades"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    midterm_score = Column(Float, nullable=True)
    final_score = Column(Float, nullable=True)
    coursework_score = Column(Float, nullable=True)
    overall_score = Column(Float, nullable=True)
    letter_grade = Column(String(2), nullable=True)  # A, A-, B+, B, etc.
    gpa_points = Column(Float, nullable=True)  # GPA points (0.0 - 4.0)
    comments = Column(String(500), nullable=True)
    is_published = Column(Boolean, default=False, nullable=False)
    graded_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    published_at = Column(DateTime, nullable=True)
    
    __table_args__ = (
        UniqueConstraint('student_id', 'course_id', name='unique_student_course_grade'),
    )
    
    # Relationships
    student = relationship("User", back_populates="grades")
    course = relationship("Course", back_populates="grades")
    
    def __repr__(self) -> str:
        return f"<Grade(id={self.id}, student_id={self.student_id}, course_id={self.course_id})>"
