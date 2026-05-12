"""
CRUD operations for Course model
"""
from typing import Any, Dict, List, Optional, Union
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.course import Course
from app.schemas.course import CourseCreate, CourseUpdate


class CRUDCourse(CRUDBase[Course, CourseCreate, CourseUpdate]):
    def get_by_code(self, db: Session, *, code: str) -> Optional[Course]:
        return db.query(Course).filter(Course.code == code).first()

    def get_by_instructor(
        self, db: Session, *, instructor_id: int, skip: int = 0, limit: int = 100
    ) -> List[Course]:
        return (
            db.query(Course)
            .filter(Course.instructor_id == instructor_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_department(
        self, db: Session, *, department_id: int, skip: int = 0, limit: int = 100
    ) -> List[Course]:
        return (
            db.query(Course)
            .filter(Course.department_id == department_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_enrolled_courses(
        self, db: Session, *, student_id: int, skip: int = 0, limit: int = 100
    ) -> List[Course]:
        from app.models.enrollment import Enrollment
        return (
            db.query(Course)
            .join(Enrollment, Enrollment.course_id == Course.id)
            .filter(Enrollment.student_id == student_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create(self, db: Session, *, obj_in: CourseCreate) -> Course:
        db_obj = Course(
            code=obj_in.code,
            name=obj_in.name,
            description=obj_in.description,
            credits=obj_in.credits,
            instructor_id=obj_in.instructor_id,
            department_id=obj_in.department_id,
            semester=obj_in.semester,
            academic_year=obj_in.academic_year,
            max_students=obj_in.max_students,
            status=obj_in.status if obj_in.status else "active",
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def enroll_student(self, db: Session, *, course_id: int, student_id: int) -> bool:
        from app.models.enrollment import Enrollment
        existing = db.query(Enrollment).filter(
            Enrollment.course_id == course_id,
            Enrollment.student_id == student_id
        ).first()
        if existing:
            return False
        
        course = self.get(db, id=course_id)
        if not course:
            return False
        
        enrollment_count = db.query(Enrollment).filter(
            Enrollment.course_id == course_id
        ).count()
        
        if course.max_students and enrollment_count >= course.max_students:
            return False
        
        enrollment = Enrollment(course_id=course_id, student_id=student_id)
        db.add(enrollment)
        db.commit()
        return True

    def unenroll_student(self, db: Session, *, course_id: int, student_id: int) -> bool:
        from app.models.enrollment import Enrollment
        enrollment = db.query(Enrollment).filter(
            Enrollment.course_id == course_id,
            Enrollment.student_id == student_id
        ).first()
        if not enrollment:
            return False
        db.delete(enrollment)
        db.commit()
        return True

    def get_enrollment_count(self, db: Session, *, course_id: int) -> int:
        from app.models.enrollment import Enrollment
        return db.query(Enrollment).filter(Enrollment.course_id == course_id).count()


course = CRUDCourse(Course)
