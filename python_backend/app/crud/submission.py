"""
CRUD operations for Assignment Submission model
"""
from typing import Any, Dict, List, Optional, Union
from sqlalchemy.orm import Session
from datetime import datetime

from app.crud.base import CRUDBase
from app.models.submission import Submission
from app.schemas.submission import SubmissionCreate, SubmissionUpdate


class CRUDSubmission(CRUDBase[Submission, SubmissionCreate, SubmissionUpdate]):
    def get_by_assignment(
        self, db: Session, *, assignment_id: int, skip: int = 0, limit: int = 100
    ) -> List[Submission]:
        return (
            db.query(Submission)
            .filter(Submission.assignment_id == assignment_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_student(
        self, db: Session, *, student_id: int, skip: int = 0, limit: int = 100
    ) -> List[Submission]:
        return (
            db.query(Submission)
            .filter(Submission.student_id == student_id)
            .order_by(Submission.submitted_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_submission_status(
        self, db: Session, *, assignment_id: int, student_id: int
    ) -> Optional[Submission]:
        return (
            db.query(Submission)
            .filter(
                Submission.assignment_id == assignment_id,
                Submission.student_id == student_id,
            )
            .first()
        )

    def has_submitted(self, db: Session, *, assignment_id: int, student_id: int) -> bool:
        submission = self.get_submission_status(
            db, assignment_id=assignment_id, student_id=student_id
        )
        return submission is not None

    def create(
        self, db: Session, *, obj_in: SubmissionCreate, student_id: int
    ) -> Submission:
        from app.models.assignment import Assignment
        
        assignment = db.query(Assignment).filter(
            Assignment.id == obj_in.assignment_id
        ).first()
        
        if not assignment:
            raise ValueError("Assignment not found")
        
        if not assignment.is_published:
            raise ValueError("Assignment is not published")
        
        existing = self.get_submission_status(
            db, assignment_id=obj_in.assignment_id, student_id=student_id
        )
        
        if existing:
            raise ValueError("Already submitted. Use update to resubmit.")
        
        now = datetime.utcnow()
        is_late = now > assignment.due_date if assignment.due_date else False
        
        db_obj = Submission(
            assignment_id=obj_in.assignment_id,
            student_id=student_id,
            submission_text=obj_in.submission_text,
            file_url=obj_in.file_url,
            submitted_at=now,
            is_late=is_late,
            status="submitted",
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def grade_submission(
        self,
        db: Session,
        *,
        submission_id: int,
        score: float,
        feedback: Optional[str] = None,
        graded_by: int,
    ) -> Submission:
        from app.models.assignment import Assignment
        
        submission = self.get(db, id=submission_id)
        if not submission:
            raise ValueError("Submission not found")
        
        assignment = db.query(Assignment).filter(
            Assignment.id == submission.assignment_id
        ).first()
        
        if score < 0 or (assignment.max_score and score > assignment.max_score):
            raise ValueError("Invalid score")
        
        submission.score = score
        submission.feedback = feedback
        submission.graded_by = graded_by
        submission.graded_at = datetime.utcnow()
        submission.status = "graded"
        
        db.add(submission)
        db.commit()
        db.refresh(submission)
        return submission

    def get_ungraded_submissions(
        self, db: Session, *, assignment_id: int, skip: int = 0, limit: int = 100
    ) -> List[Submission]:
        return (
            db.query(Submission)
            .filter(
                Submission.assignment_id == assignment_id,
                Submission.status == "submitted",
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_graded_submissions(
        self, db: Session, *, assignment_id: int, skip: int = 0, limit: int = 100
    ) -> List[Submission]:
        return (
            db.query(Submission)
            .filter(
                Submission.assignment_id == assignment_id,
                Submission.status == "graded",
            )
            .offset(skip)
            .limit(limit)
            .all()
        )


submission = CRUDSubmission(Submission)
