"""Schemas module initialization."""
from app.schemas.token import Token, TokenData, TokenRefresh
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserInDB
from app.schemas.course import CourseCreate, CourseUpdate, CourseResponse, EnrollmentCreate, EnrollmentResponse
from app.schemas.venue import VenueCreate, VenueUpdate, VenueResponse
from app.schemas.assignment import AssignmentCreate, AssignmentUpdate, AssignmentResponse, SubmissionCreate, SubmissionResponse
from app.schemas.grade import GradeCreate, GradeUpdate, GradeResponse
from app.schemas.announcement import AnnouncementCreate, AnnouncementUpdate, AnnouncementResponse, ReplyCreate, ReplyResponse
from app.schemas.attendance import AttendanceRecordResponse, QRCodeSessionCreate, QRCodeSessionResponse
from app.schemas.notification import NotificationResponse

__all__ = [
    "Token",
    "TokenData",
    "TokenRefresh",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserInDB",
    "CourseCreate",
    "CourseUpdate",
    "CourseResponse",
    "EnrollmentCreate",
    "EnrollmentResponse",
    "VenueCreate",
    "VenueUpdate",
    "VenueResponse",
    "AssignmentCreate",
    "AssignmentUpdate",
    "AssignmentResponse",
    "SubmissionCreate",
    "SubmissionResponse",
    "GradeCreate",
    "GradeUpdate",
    "GradeResponse",
    "AnnouncementCreate",
    "AnnouncementUpdate",
    "AnnouncementResponse",
    "ReplyCreate",
    "ReplyResponse",
    "AttendanceRecordResponse",
    "QRCodeSessionCreate",
    "QRCodeSessionResponse",
    "NotificationResponse",
]
