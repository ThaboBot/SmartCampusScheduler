"""
Grades endpoints
"""
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.schemas.grade import Grade as GradeSchema, GradeCreate, GradeUpdate

router = APIRouter()


@router.get("/student/me", response_model=List[GradeSchema])
def read_my_grades(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get my grades (student only).
    """
    grades = crud.grade.get_by_student(
        db, student_id=current_user.id, skip=skip, limit=limit
    )
    return grades


@router.get("/course/{course_id}", response_model=List[GradeSchema])
def read_course_grades(
    course_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get all grades for a course (instructor only).
    """
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    grades = crud.grade.get_by_course(
        db, course_id=course_id, skip=skip, limit=limit
    )
    return grades


@router.post("/", response_model=GradeSchema)
def create_grade(
    *,
    db: Session = Depends(get_db),
    grade_in: GradeCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Create new grade (instructor only).
    """
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    grade = crud.grade.create(db, obj_in=grade_in)
    return grade


@router.patch("/{grade_id}", response_model=GradeSchema)
def update_grade(
    *,
    db: Session = Depends(get_db),
    grade_id: int,
    grade_in: GradeUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update grade (instructor only).
    """
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    grade = crud.grade.get(db, id=grade_id)
    if not grade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Grade not found",
        )
    
    grade = crud.grade.update(db, db_obj=grade, obj_in=grade_in)
    return grade


@router.post("/{grade_id}/publish", response_model=GradeSchema)
def publish_grade(
    grade_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Publish grade (instructor only).
    """
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    grade = crud.grade.publish_grade(db, id=grade_id)
    return grade


@router.get("/course/{course_id}/statistics")
def get_course_statistics(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get grade statistics for a course (instructor only).
    """
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    stats = crud.grade.get_class_statistics(db, course_id=course_id)
    return stats
