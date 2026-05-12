"""
Submissions endpoints
"""
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.schemas.submission import Submission as SubmissionSchema, SubmissionCreate, SubmissionUpdate

router = APIRouter()


@router.get("/assignment/{assignment_id}", response_model=List[SubmissionSchema])
def read_submissions(
    assignment_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve all submissions for an assignment (instructor only).
    """
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    submissions = crud.submission.get_by_assignment(
        db, assignment_id=assignment_id, skip=skip, limit=limit
    )
    return submissions


@router.post("/", response_model=SubmissionSchema)
def create_submission(
    *,
    db: Session = Depends(get_db),
    submission_in: SubmissionCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Create new submission (student only).
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can submit assignments"
        )
    
    try:
        submission = crud.submission.create(
            db, obj_in=submission_in, student_id=current_user.id
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    return submission


@router.get("/{submission_id}", response_model=SubmissionSchema)
def read_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get submission by ID.
    """
    submission = crud.submission.get(db, id=submission_id)
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found",
        )
    
    # Check permissions
    if current_user.role not in ["instructor", "admin"] and submission.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return submission


@router.post("/{submission_id}/grade", response_model=SubmissionSchema)
def grade_submission(
    submission_id: int,
    score: float,
    feedback: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Grade a submission (instructor only).
    """
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        submission = crud.submission.grade_submission(
            db,
            submission_id=submission_id,
            score=score,
            feedback=feedback,
            graded_by=current_user.id,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    return submission


@router.get("/student/me", response_model=List[SubmissionSchema])
def read_my_submissions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get my submissions (student only).
    """
    submissions = crud.submission.get_by_student(
        db, student_id=current_user.id, skip=skip, limit=limit
    )
    return submissions


@router.get("/assignment/{assignment_id}/ungraded", response_model=List[SubmissionSchema])
def get_ungraded_submissions(
    assignment_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get ungraded submissions for an assignment (instructor only).
    """
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    submissions = crud.submission.get_ungraded_submissions(
        db, assignment_id=assignment_id, skip=skip, limit=limit
    )
    return submissions


@router.get("/assignment/{assignment_id}/graded", response_model=List[SubmissionSchema])
def get_graded_submissions(
    assignment_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get graded submissions for an assignment.
    """
    submissions = crud.submission.get_graded_submissions(
        db, assignment_id=assignment_id, skip=skip, limit=limit
    )
    return submissions
