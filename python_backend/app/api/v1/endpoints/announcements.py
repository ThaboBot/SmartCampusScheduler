"""
Announcements endpoints
"""
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.schemas.announcement import Announcement as AnnouncementSchema, AnnouncementCreate, AnnouncementUpdate

router = APIRouter()


@router.get("/course/{course_id}", response_model=List[AnnouncementSchema])
def read_announcements(
    course_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve all announcements for a course.
    """
    announcements = crud.announcement.get_by_course(
        db, course_id=course_id, skip=skip, limit=limit
    )
    return announcements


@router.post("/", response_model=AnnouncementSchema)
def create_announcement(
    *,
    db: Session = Depends(get_db),
    announcement_in: AnnouncementCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Create new announcement (instructor only).
    """
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    announcement = crud.announcement.create(
        db, obj_in=announcement_in, author_id=current_user.id
    )
    return announcement


@router.get("/{announcement_id}", response_model=AnnouncementSchema)
def read_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get announcement by ID.
    """
    announcement = crud.announcement.get(db, id=announcement_id)
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found",
        )
    return announcement


@router.patch("/{announcement_id}", response_model=AnnouncementSchema)
def update_announcement(
    *,
    db: Session = Depends(get_db),
    announcement_id: int,
    announcement_in: AnnouncementUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update announcement (instructor only).
    """
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    announcement = crud.announcement.get(db, id=announcement_id)
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found",
        )
    
    announcement = crud.announcement.update(db, db_obj=announcement, obj_in=announcement_in)
    return announcement


@router.delete("/{announcement_id}", response_model=AnnouncementSchema)
def delete_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Delete announcement (instructor/admin only).
    """
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    announcement = crud.announcement.get(db, id=announcement_id)
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found",
        )
    
    announcement = crud.announcement.remove(db, id=announcement_id)
    return announcement


@router.post("/{announcement_id}/pin", response_model=AnnouncementSchema)
def pin_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Pin announcement (instructor only).
    """
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    announcement = crud.announcement.pin_announcement(db, id=announcement_id)
    return announcement


@router.post("/{announcement_id}/unpin", response_model=AnnouncementSchema)
def unpin_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Unpin announcement (instructor only).
    """
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    announcement = crud.announcement.unpin_announcement(db, id=announcement_id)
    return announcement


@router.get("/pinned", response_model=List[AnnouncementSchema])
def get_pinned_announcements(
    course_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get pinned announcements.
    """
    announcements = crud.announcement.get_pinned_announcements(
        db, course_id=course_id, skip=skip, limit=limit
    )
    return announcements


@router.get("/recent", response_model=List[AnnouncementSchema])
def get_recent_announcements(
    course_id: int = None,
    days: int = 7,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get recent announcements from the last N days.
    """
    announcements = crud.announcement.get_recent_announcements(
        db, course_id=course_id, days=days, skip=skip, limit=limit
    )
    return announcements
