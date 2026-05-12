"""AttendanceRecord and QRCodeSession model definitions."""
from datetime import datetime, timedelta
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship

from app.db.base import Base


class AttendanceRecord(Base):
    """Attendance record model for tracking student attendance."""
    
    __tablename__ = "attendance_records"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    class_schedule_id = Column(Integer, ForeignKey("class_schedules.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    check_in_time = Column(DateTime, nullable=True)
    check_out_time = Column(DateTime, nullable=True)
    status = Column(String(20), default="absent", nullable=False)  # present, late, absent, excused
    qr_session_id = Column(Integer, ForeignKey("qr_code_sessions.id"), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    student = relationship("User", back_populates="attendance_records")
    class_schedule = relationship("ClassSchedule", back_populates="attendance_records")
    qr_session = relationship("QRCodeSession", back_populates="attendance_records")
    
    def __repr__(self) -> str:
        return f"<AttendanceRecord(id={self.id}, student_id={self.student_id}, date={self.date})>"


class QRCodeSession(Base):
    """QR Code session model for time-limited attendance verification."""
    
    __tablename__ = "qr_code_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    class_schedule_id = Column(Integer, ForeignKey("class_schedules.id"), nullable=False)
    session_token = Column(String(100), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    max_scans = Column(Integer, default=100, nullable=False)
    current_scans = Column(Integer, default=0, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    class_schedule = relationship("ClassSchedule", back_populates="qr_sessions")
    attendance_records = relationship("AttendanceRecord", back_populates="qr_session")
    
    def __repr__(self) -> str:
        return f"<QRCodeSession(id={self.id}, token={self.session_token[:10]}...)>"
    
    def is_valid(self) -> bool:
        """Check if the QR code session is still valid."""
        now = datetime.utcnow()
        return (
            self.is_active and
            now < self.expires_at and
            self.current_scans < self.max_scans
        )
    
    @classmethod
    def generate_expires_at(cls, duration_minutes: int = 15) -> datetime:
        """Generate expiration time for a new session."""
        return datetime.utcnow() + timedelta(minutes=duration_minutes)
