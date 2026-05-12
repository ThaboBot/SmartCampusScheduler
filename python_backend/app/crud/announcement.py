"""
CRUD operations for Announcement model
"""
from typing import Any, Dict, List, Optional, Union
from sqlalchemy.orm import Session
from datetime import datetime

from app.crud.base import CRUDBase
from app.models.announcement import Announcement
from app.schemas.announcement import AnnouncementCreate, AnnouncementUpdate


class CRUDAnnouncement(CRUDBase[Announcement, AnnouncementCreate, AnnouncementUpdate]):
    def get_by_course(
        self, db: Session, *, course_id: int, skip: int = 0, limit: int = 100
    ) -> List[Announcement]:
        return (
            db.query(Announcement)
            .filter(Announcement.course_id == course_id)
            .order_by(Announcement.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_pinned_announcements(
        self, db: Session, *, course_id: Optional[int] = None, skip: int = 0, limit: int = 100
    ) -> List[Announcement]:
        query = db.query(Announcement).filter(Announcement.is_pinned == True)
        if course_id:
            query = query.filter(Announcement.course_id == course_id)
        return query.order_by(Announcement.created_at.desc()).offset(skip).limit(limit).all()

    def get_recent_announcements(
        self,
        db: Session,
        *,
        course_id: Optional[int] = None,
        days: int = 7,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Announcement]:
        from datetime import timedelta
        
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        query = db.query(Announcement).filter(Announcement.created_at >= cutoff_date)
        
        if course_id:
            query = query.filter(Announcement.course_id == course_id)
        
        return query.order_by(Announcement.created_at.desc()).offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in: AnnouncementCreate, author_id: int) -> Announcement:
        db_obj = Announcement(
            course_id=obj_in.course_id,
            title=obj_in.title,
            content=obj_in.content,
            author_id=author_id,
            is_pinned=obj_in.is_pinned if obj_in.is_pinned is not None else False,
            is_published=obj_in.is_published if obj_in.is_published is not None else True,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def pin_announcement(self, db: Session, *, id: int) -> Announcement:
        announcement = self.get(db, id=id)
        if not announcement:
            raise ValueError("Announcement not found")
        announcement.is_pinned = True
        db.add(announcement)
        db.commit()
        db.refresh(announcement)
        return announcement

    def unpin_announcement(self, db: Session, *, id: int) -> Announcement:
        announcement = self.get(db, id=id)
        if not announcement:
            raise ValueError("Announcement not found")
        announcement.is_pinned = False
        db.add(announcement)
        db.commit()
        db.refresh(announcement)
        return announcement

    def publish_announcement(self, db: Session, *, id: int) -> Announcement:
        announcement = self.get(db, id=id)
        if not announcement:
            raise ValueError("Announcement not found")
        announcement.is_published = True
        db.add(announcement)
        db.commit()
        db.refresh(announcement)
        return announcement

    def get_announcement_with_replies(
        self, db: Session, *, id: int
    ) -> Optional[Announcement]:
        announcement = self.get(db, id=id)
        if announcement:
            db.refresh(announcement, attribute_names=["replies"])
        return announcement


announcement = CRUDAnnouncement(Announcement)
