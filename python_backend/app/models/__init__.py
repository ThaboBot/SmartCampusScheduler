"""Models module initialization."""
from app.models.user import User
from app.models.course import Course, Enrollment
from app.models.venue import Venue
from app.models.timetable import ClassSchedule, TimetableUpload
from app.models.assignment import Assignment, AssignmentSubmission
from app.models.grade import Grade
from app.models.announcement import Announcement, AnnouncementReply
from app.models.attendance import AttendanceRecord, QRCodeSession
from app.models.notification import Notification

__all__ = [
    "User",
    "Course",
    "Enrollment",
    "Venue",
    "ClassSchedule",
    "TimetableUpload",
    "Assignment",
    "AssignmentSubmission",
    "Grade",
    "Announcement",
    "AnnouncementReply",
    "AttendanceRecord",
    "QRCodeSession",
    "Notification",
]
