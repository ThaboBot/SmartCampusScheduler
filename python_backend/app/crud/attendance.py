"""
CRUD operations for Attendance model
"""
from typing import Any, Dict, List, Optional, Union
from sqlalchemy.orm import Session
from datetime import datetime

from app.crud.base import CRUDBase
from app.models.attendance import Attendance
from app.schemas.attendance import AttendanceCreate, AttendanceUpdate


class CRUDAttendance(CRUDBase[Attendance, AttendanceCreate, AttendanceUpdate]):
    def get_by_course(
        self, db: Session, *, course_id: int, skip: int = 0, limit: int = 100
    ) -> List[Attendance]:
        return (
            db.query(Attendance)
            .filter(Attendance.course_id == course_id)
            .order_by(Attendance.date.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_student(
        self, db: Session, *, student_id: int, skip: int = 0, limit: int = 100
    ) -> List[Attendance]:
        return (
            db.query(Attendance)
            .filter(Attendance.student_id == student_id)
            .order_by(Attendance.date.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_date(
        self, db: Session, *, course_id: int, date: datetime, skip: int = 0, limit: int = 100
    ) -> List[Attendance]:
        from datetime import date as dt_date
        
        if isinstance(date, datetime):
            date = date.date()
        
        return (
            db.query(Attendance)
            .filter(
                Attendance.course_id == course_id,
                Attendance.date == date,
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def mark_attendance(
        self,
        db: Session,
        *,
        course_id: int,
        student_id: int,
        date: Optional[datetime] = None,
        status: str = "present",
        qr_session_id: Optional[int] = None,
    ) -> Attendance:
        if date is None:
            date = datetime.utcnow().date()
        elif isinstance(date, datetime):
            date = date.date()
        
        existing = (
            db.query(Attendance)
            .filter(
                Attendance.course_id == course_id,
                Attendance.student_id == student_id,
                Attendance.date == date,
            )
            .first()
        )
        
        if existing:
            raise ValueError("Attendance already marked for this student on this date")
        
        db_obj = Attendance(
            course_id=course_id,
            student_id=student_id,
            date=date,
            status=status,
            qr_session_id=qr_session_id,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_attendance_rate(
        self, db: Session, *, student_id: int, course_id: Optional[int] = None
    ) -> Dict[str, Any]:
        query = db.query(Attendance).filter(Attendance.student_id == student_id)
        
        if course_id:
            query = query.filter(Attendance.course_id == course_id)
        
        records = query.all()
        
        if not records:
            return {
                "total_days": 0,
                "present": 0,
                "absent": 0,
                "late": 0,
                "excused": 0,
                "rate": 0.0,
            }
        
        total = len(records)
        present = sum(1 for r in records if r.status == "present")
        absent = sum(1 for r in records if r.status == "absent")
        late = sum(1 for r in records if r.status == "late")
        excused = sum(1 for r in records if r.status == "excused")
        
        rate = (present / total * 100) if total > 0 else 0.0
        
        return {
            "total_days": total,
            "present": present,
            "absent": absent,
            "late": late,
            "excused": excused,
            "rate": round(rate, 2),
        }

    def get_class_attendance_summary(
        self, db: Session, *, course_id: int, date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        query = db.query(Attendance).filter(Attendance.course_id == course_id)
        
        if date:
            if isinstance(date, datetime):
                date = date.date()
            query = query.filter(Attendance.date == date)
        
        records = query.all()
        
        if not records:
            return {
                "total_students": 0,
                "present": 0,
                "absent": 0,
                "late": 0,
                "excused": 0,
                "rate": 0.0,
            }
        
        total = len(records)
        present = sum(1 for r in records if r.status == "present")
        absent = sum(1 for r in records if r.status == "absent")
        late = sum(1 for r in records if r.status == "late")
        excused = sum(1 for r in records if r.status == "excused")
        
        rate = (present / total * 100) if total > 0 else 0.0
        
        return {
            "total_students": total,
            "present": present,
            "absent": absent,
            "late": late,
            "excused": excused,
            "rate": round(rate, 2),
        }


attendance = CRUDAttendance(Attendance)
