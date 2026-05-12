"""
Assignments endpoints
"""
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.schemas.assignment import Assignment as AssignmentSchema, AssignmentCreate, AssignmentUpdate

router = APIRouter()


@router.get("/course/{course_id}", response_model=List[AssignmentSchema])
def read_assignments(
    course_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve all assignments for a course.
    """
    assignments = crud.assignment.get_by_course(
        db, course_id=course_id, skip=skip, limit=limit
    )
    return assignments


@router.post("/", response_model=AssignmentSchema)
def create_assignment(
    *,
    db: Session = Depends(get_db),
    assignment_in: AssignmentCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Create new assignment (instructor only).
    """
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    assignment = crud.assignment.create(db, obj_in=assignment_in)
    return assignment


@router.get("/{assignment_id}", response_model=AssignmentSchema)
def read_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get assignment by ID.
    """
    assignment = crud.assignment.get(db, id=assignment_id)
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found",
        )
    return assignment


@router.patch("/{assignment_id}", response_model=AssignmentSchema)
def update_assignment(
    *,
    db: Session = Depends(get_db),
    assignment_id: int,
    assignment_in: AssignmentUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update assignment (instructor only).
    """
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    assignment = crud.assignment.get(db, id=assignment_id)
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found",
        )
    
    assignment = crud.assignment.update(db, db_obj=assignment, obj_in=assignment_in)
    return assignment


@router.delete("/{assignment_id}", response_model=AssignmentSchema)
def delete_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Delete assignment (instructor/admin only).
    """
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    assignment = crud.assignment.get(db, id=assignment_id)
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found",
        )
    
    assignment = crud.assignment.remove(db, id=assignment_id)
    return assignment


@router.post("/{assignment_id}/publish", response_model=AssignmentSchema)
def publish_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Publish assignment (instructor only).
    """
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    assignment = crud.assignment.publish(db, id=assignment_id)
    return assignment


@router.post("/{assignment_id}/unpublish", response_model=AssignmentSchema)
def unpublish_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Unpublish assignment (instructor only).
    """
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    assignment = crud.assignment.unpublish(db, id=assignment_id)
    return assignment


@router.get("/student/pending", response_model=List[AssignmentSchema])
def get_pending_assignments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get pending assignments for current student.
    """
    assignments = crud.assignment.get_pending_assignments(
        db, student_id=current_user.id, skip=skip, limit=limit
    )
    return assignments


@router.get("/student/overdue", response_model=List[AssignmentSchema])
def get_overdue_assignments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get overdue assignments for current student.
    """
    assignments = crud.assignment.get_overdue_assignments(
        db, student_id=current_user.id, skip=skip, limit=limit
    )
    return assignments
