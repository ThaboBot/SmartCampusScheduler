"""
Attendance endpoints
"""
from typing import Any, List
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.schemas.attendance import Attendance as AttendanceSchema, AttendanceCreate, AttendanceUpdate

router = APIRouter()


@router.get("/course/{course_id}", response_model=List[AttendanceSchema])
def read_attendance(
    course_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve all attendance records for a course.
    """
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    attendance = crud.attendance.get_by_course(
        db, course_id=course_id, skip=skip, limit=limit
    )
    return attendance


@router.post("/", response_model=AttendanceSchema)
def mark_attendance(
    *,
    db: Session = Depends(get_db),
    course_id: int,
    student_id: int,
    status: str = "present",
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Mark attendance for a student (instructor only).
    """
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        attendance = crud.attendance.mark_attendance(
            db,
            course_id=course_id,
            student_id=student_id,
            status=status,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    return attendance


@router.get("/student/me", response_model=List[AttendanceSchema])
def read_my_attendance(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get my attendance records (student only).
    """
    attendance = crud.attendance.get_by_student(
        db, student_id=current_user.id, skip=skip, limit=limit
    )
    return attendance


@router.get("/student/me/rate")
def get_my_attendance_rate(
    course_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get my attendance rate (student only).
    """
    rate = crud.attendance.get_attendance_rate(
        db, student_id=current_user.id, course_id=course_id
    )
    return rate


@router.get("/course/{course_id}/summary")
def get_class_attendance_summary(
    course_id: int,
    date: datetime = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get class attendance summary (instructor only).
    """
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    summary = crud.attendance.get_class_attendance_summary(
        db, course_id=course_id, date=date
    )
    return summary
