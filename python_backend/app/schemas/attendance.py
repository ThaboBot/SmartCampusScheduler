"""Attendance schemas for validation and serialization."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class AttendanceRecordResponse(BaseModel):
    """Schema for attendance record response."""
    id: int
    student_id: int
    class_schedule_id: int
    date: datetime
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    status: str  # present, late, absent, excused
    qr_session_id: Optional[int] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class AttendanceDetailResponse(AttendanceRecordResponse):
    """Detailed attendance response with student and class info."""
    student_name: str
    student_email: str
    course_name: str
    course_code: str
    venue_name: str


class QRCodeSessionCreate(BaseModel):
    """Schema for creating a QR code session."""
    class_schedule_id: int
    duration_minutes: int = Field(default=15, ge=1, le=60)
    max_scans: int = Field(default=100, ge=1, le=500)


class QRCodeSessionResponse(BaseModel):
    """Schema for QR code session response."""
    id: int
    class_schedule_id: int
    session_token: str
    expires_at: datetime
    is_active: bool
    max_scans: int
    current_scans: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class QRCodeScanRequest(BaseModel):
    """Schema for QR code scan request."""
    session_token: str
    class_schedule_id: int


class AttendanceHistoryResponse(BaseModel):
    """Schema for attendance history response."""
    total_classes: int
    attended: int
    absent: int
    late: int
    attendance_percentage: float
    records: List[AttendanceRecordResponse]


class AttendanceStatsResponse(BaseModel):
    """Schema for attendance statistics response."""
    course_id: int
    course_name: str
    total_students: int
    average_attendance: float
    students_with_low_attendance: List[dict]
