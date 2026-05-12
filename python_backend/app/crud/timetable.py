"""
CRUD operations for Timetable model
"""
from typing import Any, Dict, List, Optional, Union
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.timetable import Timetable
from app.schemas.timetable import TimetableCreate, TimetableUpdate


class CRUDTimetable(CRUDBase[Timetable, TimetableCreate, TimetableUpdate]):
    def get_by_course(
        self, db: Session, *, course_id: int, skip: int = 0, limit: int = 100
    ) -> List[Timetable]:
        return (
            db.query(Timetable)
            .filter(Timetable.course_id == course_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_venue(
        self, db: Session, *, venue_id: int, skip: int = 0, limit: int = 100
    ) -> List[Timetable]:
        return (
            db.query(Timetable)
            .filter(Timetable.venue_id == venue_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_instructor(
        self, db: Session, *, instructor_id: int, skip: int = 0, limit: int = 100
    ) -> List[Timetable]:
        from app.models.course import Course
        return (
            db.query(Timetable)
            .join(Course, Course.id == Timetable.course_id)
            .filter(Course.instructor_id == instructor_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_student(
        self, db: Session, *, student_id: int, skip: int = 0, limit: int = 100
    ) -> List[Timetable]:
        from app.models.course import Course
        from app.models.enrollment import Enrollment
        return (
            db.query(Timetable)
            .join(Course, Course.id == Timetable.course_id)
            .join(Enrollment, Enrollment.course_id == Course.id)
            .filter(Enrollment.student_id == student_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_schedule_by_day(
        self,
        db: Session,
        *,
        day_of_week: int,
        entity_type: str,
        entity_id: int,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Timetable]:
        from app.models.course import Course
        query = db.query(Timetable).filter(Timetable.day_of_week == day_of_week)
        
        if entity_type == "student":
            from app.models.enrollment import Enrollment
            query = (
                query.join(Course, Course.id == Timetable.course_id)
                .join(Enrollment, Enrollment.course_id == Course.id)
                .filter(Enrollment.student_id == entity_id)
            )
        elif entity_type == "instructor":
            query = (
                query.join(Course, Course.id == Timetable.course_id)
                .filter(Course.instructor_id == entity_id)
            )
        elif entity_type == "venue":
            query = query.filter(Timetable.venue_id == entity_id)
        elif entity_type == "course":
            query = query.filter(Timetable.course_id == entity_id)
        
        return query.offset(skip).limit(limit).all()

    def check_conflict(
        self,
        db: Session,
        *,
        venue_id: Optional[int] = None,
        instructor_id: Optional[int] = None,
        course_id: Optional[int] = None,
        day_of_week: int,
        time_slot: str,
    ) -> bool:
        from app.models.course import Course
        query = db.query(Timetable).filter(
            Timetable.day_of_week == day_of_week,
            Timetable.time_slot == time_slot,
        )
        
        if venue_id:
            if query.filter(Timetable.venue_id == venue_id).first():
                return True
        
        if instructor_id:
            instructor_query = db.query(Timetable).join(
                Course, Course.id == Timetable.course_id
            ).filter(
                Timetable.day_of_week == day_of_week,
                Timetable.time_slot == time_slot,
                Course.instructor_id == instructor_id,
            )
            if instructor_query.first():
                return True
        
        return False

    def create(self, db: Session, *, obj_in: TimetableCreate) -> Timetable:
        if self.check_conflict(
            db,
            venue_id=obj_in.venue_id,
            instructor_id=obj_in.instructor_id,
            day_of_week=obj_in.day_of_week,
            time_slot=obj_in.time_slot,
        ):
            raise ValueError("Schedule conflict detected")
        
        db_obj = Timetable(
            course_id=obj_in.course_id,
            venue_id=obj_in.venue_id,
            day_of_week=obj_in.day_of_week,
            time_slot=obj_in.time_slot,
            instructor_id=obj_in.instructor_id,
            semester=obj_in.semester,
            academic_year=obj_in.academic_year,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


timetable = CRUDTimetable(Timetable)
