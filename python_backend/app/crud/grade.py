"""
CRUD operations for Grade model
"""
from typing import Any, Dict, List, Optional, Union
from sqlalchemy.orm import Session
from datetime import datetime

from app.crud.base import CRUDBase
from app.models.grade import Grade
from app.schemas.grade import GradeCreate, GradeUpdate


class CRUDGrade(CRUDBase[Grade, GradeCreate, GradeUpdate]):
    def get_by_student(
        self, db: Session, *, student_id: int, skip: int = 0, limit: int = 100
    ) -> List[Grade]:
        return (
            db.query(Grade)
            .filter(Grade.student_id == student_id)
            .order_by(Grade.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_course(
        self, db: Session, *, course_id: int, skip: int = 0, limit: int = 100
    ) -> List[Grade]:
        return (
            db.query(Grade)
            .filter(Grade.course_id == course_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_student_course_grade(
        self, db: Session, *, student_id: int, course_id: int
    ) -> Optional[Grade]:
        return (
            db.query(Grade)
            .filter(
                Grade.student_id == student_id,
                Grade.course_id == course_id,
            )
            .first()
        )

    def calculate_letter_grade(self, score: float) -> str:
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

    def calculate_gpa_point(self, letter_grade: str) -> float:
        gpa_map = {
            "A": 4.0,
            "A-": 3.7,
            "B+": 3.3,
            "B": 3.0,
            "B-": 2.7,
            "C+": 2.3,
            "C": 2.0,
            "C-": 1.7,
            "D+": 1.3,
            "D": 1.0,
            "F": 0.0,
        }
        return gpa_map.get(letter_grade, 0.0)

    def create(self, db: Session, *, obj_in: GradeCreate) -> Grade:
        letter_grade = self.calculate_letter_grade(obj_in.score)
        gpa_point = self.calculate_gpa_point(letter_grade)
        
        db_obj = Grade(
            student_id=obj_in.student_id,
            course_id=obj_in.course_id,
            midterm_score=obj_in.midterm_score,
            final_score=obj_in.final_score,
            score=obj_in.score,
            letter_grade=letter_grade,
            gpa_point=gpa_point,
            comments=obj_in.comments,
            is_published=obj_in.is_published if obj_in.is_published is not None else False,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_grade(
        self,
        db: Session,
        *,
        student_id: int,
        course_id: int,
        midterm_score: Optional[float] = None,
        final_score: Optional[float] = None,
        overall_score: Optional[float] = None,
        comments: Optional[str] = None,
    ) -> Grade:
        grade = self.get_student_course_grade(
            db, student_id=student_id, course_id=course_id
        )
        
        if not grade:
            raise ValueError("Grade record not found")
        
        update_data = {}
        if midterm_score is not None:
            update_data["midterm_score"] = midterm_score
        if final_score is not None:
            update_data["final_score"] = final_score
        if overall_score is not None:
            update_data["score"] = overall_score
            update_data["letter_grade"] = self.calculate_letter_grade(overall_score)
            update_data["gpa_point"] = self.calculate_gpa_point(
                update_data["letter_grade"]
            )
        if comments is not None:
            update_data["comments"] = comments
        
        return self.update(db, db_obj=grade, obj_in=update_data)

    def publish_grade(self, db: Session, *, id: int) -> Grade:
        grade = self.get(db, id=id)
        if not grade:
            raise ValueError("Grade not found")
        grade.is_published = True
        grade.published_at = datetime.utcnow()
        db.add(grade)
        db.commit()
        db.refresh(grade)
        return grade

    def get_class_statistics(
        self, db: Session, *, course_id: int
    ) -> Dict[str, Any]:
        grades = self.get_by_course(db, course_id=course_id)
        
        if not grades:
            return {
                "count": 0,
                "average": 0,
                "min": 0,
                "max": 0,
                "median": 0,
            }
        
        scores = [g.score for g in grades if g.score is not None]
        
        if not scores:
            return {
                "count": 0,
                "average": 0,
                "min": 0,
                "max": 0,
                "median": 0,
            }
        
        sorted_scores = sorted(scores)
        n = len(sorted_scores)
        median = (
            (sorted_scores[n // 2 - 1] + sorted_scores[n // 2]) / 2
            if n % 2 == 0
            else sorted_scores[n // 2]
        )
        
        return {
            "count": n,
            "average": sum(scores) / n,
            "min": min(scores),
            "max": max(scores),
            "median": median,
        }


grade = CRUDGrade(Grade)
