"""Assignment schemas for validation and serialization."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class AssignmentBase(BaseModel):
    """Base assignment schema with common fields."""
    title: str = Field(..., min_length=2, max_length=255)
    description: str
    instructions: Optional[str] = None
    due_date: datetime
    max_score: float = Field(default=100.0, ge=0)
    weight_percentage: float = Field(default=10.0, ge=0, le=100)
    allow_late_submission: bool = True
    late_penalty_percentage: Optional[float] = Field(None, ge=0, le=100)


class AssignmentCreate(AssignmentBase):
    """Schema for creating a new assignment."""
    course_id: int


class AssignmentUpdate(BaseModel):
    """Schema for updating an assignment."""
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    max_score: Optional[float] = Field(None, ge=0)
    is_published: Optional[bool] = None


class AssignmentResponse(AssignmentBase):
    """Schema for assignment response."""
    id: int
    course_id: int
    is_published: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class AssignmentDetailResponse(AssignmentResponse):
    """Detailed assignment response with submission stats."""
    total_submissions: int = 0
    graded_submissions: int = 0
    pending_submissions: int = 0


class SubmissionBase(BaseModel):
    """Base submission schema."""
    submission_text: Optional[str] = None


class SubmissionCreate(SubmissionBase):
    """Schema for creating a submission."""
    assignment_id: int
    file_path: Optional[str] = None


class SubmissionUpdate(BaseModel):
    """Schema for updating a submission (grading)."""
    score: Optional[float] = Field(None, ge=0)
    feedback: Optional[str] = None


class SubmissionResponse(BaseModel):
    """Schema for submission response."""
    id: int
    assignment_id: int
    student_id: int
    submission_text: Optional[str] = None
    file_path: Optional[str] = None
    submitted_at: Optional[datetime] = None
    status: str
    score: Optional[float] = None
    feedback: Optional[str] = None
    is_late: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class SubmissionsListResponse(BaseModel):
    """Schema for list of submissions response."""
    total: int
    submissions: List[SubmissionResponse]
