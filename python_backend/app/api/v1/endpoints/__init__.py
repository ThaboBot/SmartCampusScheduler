"""
API Endpoints Module
"""
from .auth import router as auth_router
from .users import router as users_router
from .courses import router as courses_router
from .venues import router as venues_router
from .timetable import router as timetable_router
from .assignments import router as assignments_router
from .submissions import router as submissions_router
from .grades import router as grades_router
from .announcements import router as announcements_router
from .attendance import router as attendance_router

__all__ = [
    "auth_router",
    "users_router",
    "courses_router",
    "venues_router",
    "timetable_router",
    "assignments_router",
    "submissions_router",
    "grades_router",
    "announcements_router",
    "attendance_router",
]
