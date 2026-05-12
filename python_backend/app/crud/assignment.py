"""
CRUD operations for Assignment model
"""
from typing import Any, Dict, List, Optional, Union
from sqlalchemy.orm import Session
from datetime import datetime

from app.crud.base import CRUDBase
from app.models.assignment import Assignment
from app.schemas.assignment import AssignmentCreate, AssignmentUpdate


class CRUDAssignment(CRUDBase[Assignment, AssignmentCreate, AssignmentUpdate]):
    def get_by_course(
        self, db: Session, *, course_id: int, skip: int = 0, limit: int = 100
    ) -> List[Assignment]:
        return (
            db.query(Assignment)
            .filter(Assignment.course_id == course_id)
            .order_by(Assignment.due_date.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_pending_assignments(
        self,
        db: Session,
        *,
        student_id: int,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Assignment]:
        from app.models.course import Course
        from app.models.enrollment import Enrollment
        from app.models.submission import Submission
        
        now = datetime.utcnow()
        
        subquery = (
            db.query(Submission.assignment_id)
            .filter(Submission.student_id == student_id)
            .subquery()
        )
        
        return (
            db.query(Assignment)
            .join(Course, Course.id == Assignment.course_id)
            .join(Enrollment, Enrollment.course_id == Course.id)
            .filter(
                Enrollment.student_id == student_id,
                Assignment.due_date > now,
                ~Assignment.id.in_(subquery),
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_overdue_assignments(
        self,
        db: Session,
        *,
        student_id: int,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Assignment]:
        from app.models.course import Course
        from app.models.enrollment import Enrollment
        from app.models.submission import Submission
        
        now = datetime.utcnow()
        
        subquery = (
            db.query(Submission.assignment_id)
            .filter(Submission.student_id == student_id)
            .subquery()
        )
        
        return (
            db.query(Assignment)
            .join(Course, Course.id == Assignment.course_id)
            .join(Enrollment, Enrollment.course_id == Course.id)
            .filter(
                Enrollment.student_id == student_id,
                Assignment.due_date < now,
                ~Assignment.id.in_(subquery),
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create(self, db: Session, *, obj_in: AssignmentCreate) -> Assignment:
        db_obj = Assignment(
            course_id=obj_in.course_id,
            title=obj_in.title,
            description=obj_in.description,
            assignment_type=obj_in.assignment_type,
            max_score=obj_in.max_score,
            due_date=obj_in.due_date,
            instructions=obj_in.instructions,
            attachment_url=obj_in.attachment_url,
            is_published=obj_in.is_published if obj_in.is_published is not None else False,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def publish(self, db: Session, *, id: int) -> Assignment:
        assignment = self.get(db, id=id)
        if not assignment:
            raise ValueError("Assignment not found")
        assignment.is_published = True
        db.add(assignment)
        db.commit()
        db.refresh(assignment)
        return assignment

    def unpublish(self, db: Session, *, id: int) -> Assignment:
        assignment = self.get(db, id=id)
        if not assignment:
            raise ValueError("Assignment not found")
        assignment.is_published = False
        db.add(assignment)
        db.commit()
        db.refresh(assignment)
        return assignment


assignment = CRUDAssignment(Assignment)
