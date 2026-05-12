"""
Courses endpoints
"""
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.schemas.course import Course as CourseSchema, CourseCreate, CourseUpdate

router = APIRouter()


@router.get("/", response_model=List[CourseSchema])
def read_courses(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve all courses.
    """
    courses = crud.course.get_multi(db, skip=skip, limit=limit)
    return courses


@router.post("/", response_model=CourseSchema)
def create_course(
    *,
    db: Session = Depends(get_db),
    course_in: CourseCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Create new course (instructor/admin only).
    """
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    course = crud.course.get_by_code(db, code=course_in.code)
    if course:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A course with this code already exists.",
        )
    
    course = crud.course.create(db, obj_in=course_in)
    return course


@router.get("/{course_id}", response_model=CourseSchema)
def read_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get course by ID.
    """
    course = crud.course.get(db, id=course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )
    return course


@router.patch("/{course_id}", response_model=CourseSchema)
def update_course(
    *,
    db: Session = Depends(get_db),
    course_id: int,
    course_in: CourseUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update course (instructor/admin only).
    """
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    course = crud.course.get(db, id=course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )
    
    course = crud.course.update(db, db_obj=course, obj_in=course_in)
    return course


@router.delete("/{course_id}", response_model=CourseSchema)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Delete course (admin only).
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    course = crud.course.get(db, id=course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )
    
    course = crud.course.remove(db, id=course_id)
    return course


@router.post("/{course_id}/enroll", response_model=dict)
def enroll_course(
    course_id: int,
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Enroll a student in a course.
    """
    success = crud.course.enroll_student(
        db, course_id=course_id, student_id=student_id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Enrollment failed. Course may be full or student already enrolled.",
        )
    return {"message": "Successfully enrolled"}


@router.post("/{course_id}/unenroll", response_model=dict)
def unenroll_course(
    course_id: int,
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Unenroll a student from a course.
    """
    success = crud.course.unenroll_student(
        db, course_id=course_id, student_id=student_id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unenrollment failed. Student may not be enrolled.",
        )
    return {"message": "Successfully unenrolled"}


@router.get("/{course_id}/enrollment-count")
def get_enrollment_count(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get enrollment count for a course.
    """
    count = crud.course.get_enrollment_count(db, course_id=course_id)
    return {"count": count}
