"""API v1 router - combines all endpoint routers."""
from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    users,
    courses,
    venues,
    timetable,
    assignments,
    grades,
    announcements,
    attendance,
    notifications,
)

api_router = APIRouter()

# Authentication endpoints
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# User management endpoints
api_router.include_router(users.router, prefix="/users", tags=["Users"])

# Course management endpoints
api_router.include_router(courses.router, prefix="/courses", tags=["Courses"])

# Venue management endpoints
api_router.include_router(venues.router, prefix="/venues", tags=["Venues"])

# Timetable endpoints
api_router.include_router(timetable.router, prefix="/timetable", tags=["Timetable"])

# Assignment endpoints
api_router.include_router(assignments.router, prefix="/assignments", tags=["Assignments"])

# Grade endpoints
api_router.include_router(grades.router, prefix="/grades", tags=["Grades"])

# Announcement endpoints
api_router.include_router(announcements.router, prefix="/announcements", tags=["Announcements"])

# Attendance endpoints
api_router.include_router(attendance.router, prefix="/attendance", tags=["Attendance"])

# Notification endpoints
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
