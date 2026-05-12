"""
CampusScheduler Python Backend - Main Application Entry Point
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.exceptions import AppException, AppExceptionCodes
from app.db.session import init_db, close_db
from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown events."""
    # Startup
    await init_db()
    print(f"✅ Application started on port {settings.PORT}")
    
    yield
    
    # Shutdown
    await close_db()
    print("✅ Application shutdown complete")


app = FastAPI(
    title="CampusScheduler API",
    description="""
## CampusScheduler Python Backend

A comprehensive Learning Management System (LMS) backend with features for:

### 📚 Course Management
- Course enrollment and tracking
- Timetable scheduling
- Venue management

### 📝 Assignments & Grades
- Assignment creation and submission
- Grading and feedback
- GPA calculation

### 📢 Communication
- Announcements and discussions
- Real-time notifications via WebSocket
- Email notifications

### ✅ Attendance
- QR code-based check-in
- Attendance tracking and reports
- Fraud prevention

### 🤖 AI-Powered Features
- Venue conflict resolution
- Usage pattern analysis
- Attendance prediction

### 🔐 Security
- JWT authentication
- Role-based access control
- Password hashing with bcrypt
    """,
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    """Handle custom application exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details if exc.details else None
            }
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle uncaught exceptions."""
    if settings.DEBUG:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": str(exc),
                    "type": type(exc).__name__
                }
            }
        )
    else:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected error occurred"
                }
            }
        )


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint - API information."""
    return {
        "name": "CampusScheduler API",
        "version": "2.0.0",
        "description": "Modern Python backend for CampusScheduler LMS",
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "campusscheduler-python-backend",
        "version": "2.0.0"
    }


# Include API router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
