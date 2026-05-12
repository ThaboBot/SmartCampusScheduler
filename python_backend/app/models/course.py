"""Course and Enrollment model definitions."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.base import Base


class Course(Base):
    """Course model representing academic courses."""
    
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False, index=True)
    department = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    credits = Column(Integer, default=3, nullable=False)
    lecturer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    semester = Column(String(50), nullable=False)
    academic_year = Column(String(20), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    lecturer = relationship("User", back_populates="courses_taught", foreign_keys=[lecturer_id])
    enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete-orphan")
    classes = relationship("ClassSchedule", back_populates="course", cascade="all, delete-orphan")
    assignments = relationship("Assignment", back_populates="course", cascade="all, delete-orphan")
    grades = relationship("Grade", back_populates="course", cascade="all, delete-orphan")
    announcements = relationship("Announcement", back_populates="course", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<Course(id={self.id}, code={self.code}, name={self.name})>"


class Enrollment(Base):
    """Enrollment model representing student-course relationships."""
    
    __tablename__ = "enrollments"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    enrollment_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(String(20), default="active", nullable=False)  # active, dropped, completed
    final_grade = Column(String(2), nullable=True)  # Letter grade
    gpa_points = Column(Integer, nullable=True)  # GPA points earned
    
    __table_args__ = (
        UniqueConstraint('student_id', 'course_id', name='unique_student_course'),
    )
    
    # Relationships
    student = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")
    
    def __repr__(self) -> str:
        return f"<Enrollment(student_id={self.student_id}, course_id={self.course_id})>"
