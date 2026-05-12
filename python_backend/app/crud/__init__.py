"""
CRUD Operations Base Module
"""
from .base import CRUDBase
from .user import CRUDUser
from .course import CRUDCourse
from .venue import CRUDVenue
from .timetable import CRUDTimetable
from .assignment import CRUDAssignment
from .submission import CRUDSubmission
from .grade import CRUDGrade
from .announcement import CRUDAnnouncement
from .attendance import CRUDAttendance

__all__ = [
    "CRUDBase",
    "CRUDUser",
    "CRUDCourse",
    "CRUDVenue",
    "CRUDTimetable",
    "CRUDAssignment",
    "CRUDSubmission",
    "CRUDGrade",
    "CRUDAnnouncement",
    "CRUDAttendance",
]
