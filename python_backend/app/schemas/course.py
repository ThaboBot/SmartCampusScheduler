"""Course schemas for validation and serialization."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class CourseBase(BaseModel):
    """Base course schema with common fields."""
    name: str = Field(..., min_length=2, max_length=255)
    code: str = Field(..., min_length=2, max_length=50)
    department: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    credits: int = Field(default=3, ge=1, le=10)
    semester: str = Field(..., min_length=2, max_length=50)
    academic_year: str = Field(..., min_length=4, max_length=9)  # e.g., "2023-2024"


class CourseCreate(CourseBase):
    """Schema for creating a new course."""
    lecturer_id: int


class CourseUpdate(BaseModel):
    """Schema for updating a course."""
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    credits: Optional[int] = Field(None, ge=1, le=10)
    is_active: Optional[bool] = None


class CourseResponse(CourseBase):
    """Schema for course response."""
    id: int
    lecturer_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class CourseDetailResponse(CourseResponse):
    """Detailed course response with relationships."""
    enrolled_students: int = 0
    total_assignments: int = 0
    total_announcements: int = 0


class EnrollmentBase(BaseModel):
    """Base enrollment schema."""
    student_id: int
    course_id: int


class EnrollmentCreate(EnrollmentBase):
    """Schema for creating an enrollment."""
    pass


class EnrollmentResponse(BaseModel):
    """Schema for enrollment response."""
    id: int
    student_id: int
    course_id: int
    enrollment_date: datetime
    status: str
    final_grade: Optional[str] = None
    gpa_points: Optional[float] = None
    
    model_config = ConfigDict(from_attributes=True)


class CoursesListResponse(BaseModel):
    """Schema for list of courses response."""
    total: int
    courses: List[CourseResponse]
