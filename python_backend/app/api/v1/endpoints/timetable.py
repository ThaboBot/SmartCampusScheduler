"""
Timetable endpoints
"""
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.schemas.timetable import Timetable as TimetableSchema, TimetableCreate, TimetableUpdate

router = APIRouter()


@router.get("/", response_model=List[TimetableSchema])
def read_timetables(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve all timetables.
    """
    timetables = crud.timetable.get_multi(db, skip=skip, limit=limit)
    return timetables


@router.post("/", response_model=TimetableSchema)
def create_timetable(
    *,
    db: Session = Depends(get_db),
    timetable_in: TimetableCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Create new timetable entry (admin/instructor only).
    """
    if current_user.role not in ["admin", "instructor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        timetable = crud.timetable.create(db, obj_in=timetable_in)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    return timetable


@router.get("/{timetable_id}", response_model=TimetableSchema)
def read_timetable(
    timetable_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get timetable by ID.
    """
    timetable = crud.timetable.get(db, id=timetable_id)
    if not timetable:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timetable not found",
        )
    return timetable


@router.patch("/{timetable_id}", response_model=TimetableSchema)
def update_timetable(
    *,
    db: Session = Depends(get_db),
    timetable_id: int,
    timetable_in: TimetableUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update timetable (admin/instructor only).
    """
    if current_user.role not in ["admin", "instructor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    timetable = crud.timetable.get(db, id=timetable_id)
    if not timetable:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timetable not found",
        )
    
    timetable = crud.timetable.update(db, db_obj=timetable, obj_in=timetable_in)
    return timetable


@router.delete("/{timetable_id}", response_model=TimetableSchema)
def delete_timetable(
    timetable_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Delete timetable (admin only).
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    timetable = crud.timetable.get(db, id=timetable_id)
    if not timetable:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timetable not found",
        )
    
    timetable = crud.timetable.remove(db, id=timetable_id)
    return timetable


@router.get("/student/{student_id}", response_model=List[TimetableSchema])
def get_student_timetable(
    student_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get timetable for a specific student.
    """
    timetables = crud.timetable.get_by_student(
        db, student_id=student_id, skip=skip, limit=limit
    )
    return timetables


@router.get("/course/{course_id}", response_model=List[TimetableSchema])
def get_course_timetable(
    course_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get timetable for a specific course.
    """
    timetables = crud.timetable.get_by_course(
        db, course_id=course_id, skip=skip, limit=limit
    )
    return timetables


@router.get("/day/{day_of_week}")
def get_schedule_by_day(
    day_of_week: int,
    entity_type: str,
    entity_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get schedule for a specific day.
    entity_type can be: student, instructor, venue, course
    """
    if entity_type not in ["student", "instructor", "venue", "course"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid entity type"
        )
    
    schedules = crud.timetable.get_schedule_by_day(
        db,
        day_of_week=day_of_week,
        entity_type=entity_type,
        entity_id=entity_id,
        skip=skip,
        limit=limit,
    )
    return schedules
