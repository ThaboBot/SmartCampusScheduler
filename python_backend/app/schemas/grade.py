"""Grade schemas for validation and serialization."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class GradeBase(BaseModel):
    """Base grade schema with common fields."""
    midterm_score: Optional[float] = Field(None, ge=0, le=100)
    final_score: Optional[float] = Field(None, ge=0, le=100)
    coursework_score: Optional[float] = Field(None, ge=0, le=100)
    overall_score: Optional[float] = Field(None, ge=0, le=100)
    letter_grade: Optional[str] = Field(None, max_length=2)  # A, A-, B+, etc.
    gpa_points: Optional[float] = Field(None, ge=0.0, le=4.0)
    comments: Optional[str] = Field(None, max_length=500)


class GradeCreate(GradeBase):
    """Schema for creating a new grade."""
    student_id: int
    course_id: int


class GradeUpdate(BaseModel):
    """Schema for updating a grade."""
    midterm_score: Optional[float] = Field(None, ge=0, le=100)
    final_score: Optional[float] = Field(None, ge=0, le=100)
    coursework_score: Optional[float] = Field(None, ge=0, le=100)
    overall_score: Optional[float] = Field(None, ge=0, le=100)
    letter_grade: Optional[str] = Field(None, max_length=2)
    gpa_points: Optional[float] = Field(None, ge=0.0, le=4.0)
    comments: Optional[str] = Field(None, max_length=500)
    is_published: Optional[bool] = None


class GradeResponse(GradeBase):
    """Schema for grade response."""
    id: int
    student_id: int
    course_id: int
    is_published: bool
    graded_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class GradeDetailResponse(GradeResponse):
    """Detailed grade response with student and course info."""
    student_name: str
    student_email: str
    course_name: str
    course_code: str


class GradesListResponse(BaseModel):
    """Schema for list of grades response."""
    total: int
    grades: List[GradeResponse]


class GPAResponse(BaseModel):
    """Schema for GPA calculation response."""
    student_id: int
    cumulative_gpa: float
    total_credits: int
    semester_gpas: List[dict]
