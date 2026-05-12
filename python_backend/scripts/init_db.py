"""
Database initialization script
Creates tables and initial admin user
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal
from app.db.base_class import Base
from app import crud
from app.schemas.user import UserCreate

def init_db() -> None:
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Create admin user if not exists
        admin = crud.user.get_by_email(db, email="admin@campusscheduler.com")
        if not admin:
            user_in = UserCreate(
                email="admin@campusscheduler.com",
                username="admin",
                password="admin123",
                full_name="System Administrator",
                role="admin",
            )
            admin = crud.user.create(db, obj_in=user_in)
            print(f"Admin user created: {admin.email}")
        else:
            print("Admin user already exists")
        
        # Create sample instructor
        instructor = crud.user.get_by_email(db, email="instructor@campusscheduler.com")
        if not instructor:
            user_in = UserCreate(
                email="instructor@campusscheduler.com",
                username="instructor",
                password="instructor123",
                full_name="Sample Instructor",
                role="instructor",
            )
            instructor = crud.user.create(db, obj_in=user_in)
            print(f"Instructor user created: {instructor.email}")
        
        # Create sample student
        student = crud.user.get_by_email(db, email="student@campusscheduler.com")
        if not student:
            user_in = UserCreate(
                email="student@campusscheduler.com",
                username="student",
                password="student123",
                full_name="Sample Student",
                role="student",
                student_id="STU001",
            )
            student = crud.user.create(db, obj_in=user_in)
            print(f"Student user created: {student.email}")
        
        print("\n✅ Database initialized successfully!")
        print("\nDefault credentials:")
        print("  Admin: admin@campusscheduler.com / admin123")
        print("  Instructor: instructor@campusscheduler.com / instructor123")
        print("  Student: student@campusscheduler.com / student123")
        
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
