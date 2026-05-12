"""
Analytics service for generating insights and reports.
Provides statistics on courses, attendance, grades, and user activity.
"""
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.models.course import Course, Enrollment
from app.models.attendance import Attendance
from app.models.grade import Grade
from app.models.assignment import Assignment
from app.models.submission import Submission


class AnalyticsService:
    """Service for generating analytics and reports."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_dashboard_stats(self, user_id: int, role: UserRole) -> Dict[str, Any]:
        """Get overview statistics for dashboard."""
        stats = {
            "total_courses": 0,
            "total_students": 0,
            "total_assignments": 0,
            "pending_submissions": 0,
            "average_attendance": 0.0,
            "average_gpa": 0.0,
        }
        
        if role == UserRole.ADMIN:
            # Admin sees system-wide stats
            stats["total_courses"] = await self._count_all_courses()
            stats["total_students"] = await self._count_all_students()
            stats["total_assignments"] = await self._count_all_assignments()
            stats["average_attendance"] = await self._calculate_system_attendance_rate()
            stats["average_gpa"] = await self._calculate_system_average_gpa()
            
        elif role == UserRole.LECTURER:
            # Lecturer sees their course stats
            courses = await self._get_lecturer_courses(user_id)
            stats["total_courses"] = len(courses)
            stats["total_students"] = await self._count_students_in_courses(courses)
            stats["total_assignments"] = await self._count_assignments_in_courses(courses)
            stats["pending_submissions"] = await self._count_pending_submissions(courses)
            stats["average_attendance"] = await self._calculate_course_attendance_rate(courses)
            
        elif role == UserRole.STUDENT:
            # Student sees their personal stats
            enrollments = await self._get_student_enrollments(user_id)
            stats["total_courses"] = len(enrollments)
            stats["average_attendance"] = await self._calculate_student_attendance_rate(user_id)
            stats["average_gpa"] = await self._calculate_student_gpa(user_id)
            stats["pending_assignments"] = await self._count_student_pending_submissions(user_id)
        
        return stats
    
    async def get_course_analytics(self, course_id: int) -> Dict[str, Any]:
        """Get detailed analytics for a specific course."""
        return {
            "enrollment_count": await self._count_course_enrollments(course_id),
            "attendance_rate": await self._calculate_single_course_attendance(course_id),
            "average_grade": await self._calculate_course_average_grade(course_id),
            "assignment_completion_rate": await self._calculate_assignment_completion_rate(course_id),
            "grade_distribution": await self._get_grade_distribution(course_id),
        }
    
    async def get_attendance_report(
        self,
        course_id: Optional[int] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> List[Dict[str, Any]]:
        """Generate attendance report."""
        query = select(
            Attendance.user_id,
            Attendance.course_id,
            func.count(Attendance.id).label("total_sessions"),
            func.sum(func.case((Attendance.status == "present", 1), else_=0)).label("present_count"),
        )
        
        if course_id:
            query = query.where(Attendance.course_id == course_id)
        if start_date:
            query = query.where(Attendance.date >= start_date)
        if end_date:
            query = query.where(Attendance.date <= end_date)
        
        query = query.group_by(Attendance.user_id, Attendance.course_id)
        result = await self.db.execute(query)
        rows = result.fetchall()
        
        return [
            {
                "user_id": row.user_id,
                "course_id": row.course_id,
                "total_sessions": row.total_sessions,
                "present_count": row.present_count,
                "attendance_rate": (row.present_count / row.total_sessions * 100) if row.total_sessions > 0 else 0,
            }
            for row in rows
        ]
    
    async def get_grade_report(
        self,
        course_id: Optional[int] = None,
        user_id: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """Generate grade report."""
        query = select(
            Grade.user_id,
            Grade.course_id,
            Grade.midterm_grade,
            Grade.final_grade,
            Grade.overall_grade,
            Grade.gpa,
        )
        
        if course_id:
            query = query.where(Grade.course_id == course_id)
        if user_id:
            query = query.where(Grade.user_id == user_id)
        
        result = await self.db.execute(query)
        rows = result.fetchall()
        
        return [
            {
                "user_id": row.user_id,
                "course_id": row.course_id,
                "midterm_grade": row.midterm_grade,
                "final_grade": row.final_grade,
                "overall_grade": row.overall_grade,
                "gpa": row.gpa,
                "letter_grade": self._calculate_letter_grade(row.overall_grade),
            }
            for row in rows
        ]
    
    async def _count_all_courses(self) -> int:
        """Count total courses in system."""
        query = select(func.count(Course.id))
        result = await self.db.execute(query)
        return result.scalar() or 0
    
    async def _count_all_students(self) -> int:
        """Count total students in system."""
        query = select(func.count(User.id)).where(User.role == UserRole.STUDENT)
        result = await self.db.execute(query)
        return result.scalar() or 0
    
    async def _count_all_assignments(self) -> int:
        """Count total assignments in system."""
        query = select(func.count(Assignment.id))
        result = await self.db.execute(query)
        return result.scalar() or 0
    
    async def _get_lecturer_courses(self, lecturer_id: int) -> List[int]:
        """Get course IDs taught by lecturer."""
        query = select(Course.id).where(Course.lecturer_id == lecturer_id)
        result = await self.db.execute(query)
        return [row[0] for row in result.fetchall()]
    
    async def _get_student_enrollments(self, student_id: int) -> List[int]:
        """Get course IDs student is enrolled in."""
        query = select(Enrollment.course_id).where(Enrollment.user_id == student_id)
        result = await self.db.execute(query)
        return [row[0] for row in result.fetchall()]
    
    def _calculate_letter_grade(self, score: Optional[float]) -> str:
        """Convert numeric score to letter grade."""
        if score is None:
            return "N/A"
        if score >= 90:
            return "A"
        elif score >= 80:
            return "B"
        elif score >= 70:
            return "C"
        elif score >= 60:
            return "D"
        else:
            return "F"


__all__ = ["AnalyticsService"]
