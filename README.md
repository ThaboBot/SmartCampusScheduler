# CampusScheduler - Comprehensive Learning Management System

[![Python Version](https://img.shields.io/badge/python-3.9%2B-blue)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-green)](https://fastapi.tiangolo.com/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-orange)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

A modern, full-featured **Learning Management System (LMS)** and **Campus Scheduling Platform** built with Python FastAPI, designed to streamline academic operations for universities, colleges, and educational institutions.

---

## 🚀 Key Features

### 📅 Core Scheduling
- **Smart Timetable Generation**: Conflict-free class scheduling with venue optimization
- **Venue Management**: Real-time availability tracking for classrooms, labs, and auditoriums
- **Course Management**: Comprehensive course catalog with prerequisites and credits
- **User Roles**: Multi-tier access (Admin, Professor, Student, Staff)

### 📚 Academic Management
- **Assignment System**: Create, distribute, collect, and grade assignments with deadlines
- **Submission Tracking**: Late submission handling, file uploads, and plagiarism detection hooks
- **Grade Book**: Automated GPA calculation, letter grades, midterm/final grading, and transcript generation
- **Attendance System**: QR code-based check-in with anti-fraud verification and session management

### 💬 Communication Hub
- **Announcements**: Course-wide broadcasts with priority levels and scheduling
- **Discussion Threads**: Nested replies for Q&A, peer support, and instructor feedback
- **Notifications**: Real-time alerts via email, push notifications, and in-app messaging

### 🔐 Security & Authentication
- **JWT-based Auth**: Secure token management with refresh tokens
- **Role-Based Access Control (RBAC)**: Granular permissions per user role
- **Password Hashing**: bcrypt encryption for credential security
- **Session Management**: Active session tracking and forced logout capabilities

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Clients                        │
│  (React/Vue Web App, Mobile Apps, Admin Dashboard)          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway / Load Balancer               │
│                    (Nginx / Traefik)                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  FastAPI Backend Application                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   API Routers (v1)                    │   │
│  │  /auth  /users  /courses  /venues  /timetable         │   │
│  │  /assignments  /grades  /announcements  /attendance   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                Business Logic Layer                   │   │
│  │  Services, Validators, Dependency Injection           │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                 Data Access Layer                     │   │
│  │  SQLAlchemy ORM, Repository Pattern                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     PostgreSQL Database                      │
│  Tables: users, courses, venues, timetable, assignments,     │
│  submissions, grades, announcements, attendance, qr_sessions │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  External Services                           │
│  Redis (Cache), SMTP (Email), Cloud Storage (Files)         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
python_backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Environment configuration & settings
│   ├── database.py             # Database connection & session management
│   ├── models/                 # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── course.py
│   │   ├── venue.py
│   │   ├── timetable.py
│   │   ├── assignment.py
│   │   ├── grade.py
│   │   ├── announcement.py
│   │   └── attendance.py
│   ├── schemas/                # Pydantic validation schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── course.py
│   │   ├── assignment.py
│   │   ├── grade.py
│   │   └── ...
│   ├── api/
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py       # Main API router aggregator
│   │       ├── auth.py
│   │       ├── users.py
│   │       ├── courses.py
│   │       ├── venues.py
│   │       ├── timetable.py
│   │       ├── assignments.py
│   │       ├── grades.py
│   │       ├── announcements.py
│   │       └── attendance.py
│   ├── services/               # Business logic layer
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── assignment_service.py
│   │   ├── grade_service.py
│   │   ├── notification_service.py
│   │   └── qr_code_service.py
│   ├── utils/                  # Helper utilities
│   │   ├── __init__.py
│   │   ├── security.py         # Password hashing, JWT handling
│   │   ├── validators.py       # Custom validation logic
│   │   └── email_sender.py     # SMTP email utilities
│   └── core/                   # Core application constants
│       ├── __init__.py
│       └── exceptions.py       # Custom exception handlers
├── tests/                      # Pytest test suites
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_assignments.py
│   └── ...
├── migrations/                 # Alembic database migrations
├── .env.example                # Environment variable template
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Containerization config
└── README.md                   # This file
```

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend Framework** | FastAPI (Python 3.9+) |
| **Database** | PostgreSQL 14+ |
| **ORM** | SQLAlchemy 2.0 (Async) |
| **Validation** | Pydantic V2 |
| **Authentication** | JWT (PyJWT), OAuth2 |
| **Password Hashing** | bcrypt |
| **Migrations** | Alembic |
| **Testing** | Pytest, HTTPX |
| **Documentation** | Swagger UI, ReDoc |
| **Containerization** | Docker, Docker Compose |
| **Caching** | Redis (optional) |
| **File Storage** | AWS S3 / Local Storage |

---

## 🚦 Getting Started

### Prerequisites

- Python 3.9 or higher
- PostgreSQL 14+
- Docker & Docker Compose (optional but recommended)
- pip or poetry for dependency management

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/campus-scheduler.git
cd campus-scheduler/python_backend
```

### 2. Environment Setup

Create a `.env` file from the example template:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/campus_scheduler

# Security
SECRET_KEY=your-super-secret-jwt-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Application
APP_NAME=CampusScheduler
DEBUG=true
CORS_ORIGINS=["http://localhost:3000","http://localhost:8080"]

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# File Upload
MAX_UPLOAD_SIZE=10485760  # 10MB
UPLOAD_DIR=./uploads
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Database Setup

Create the database:

```bash
createdb campus_scheduler
```

Run migrations:

```bash
alembic upgrade head
```

### 5. Run the Application

**Development Mode:**

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Production Mode:**

```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### 6. Access API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

---

## 📡 API Endpoints Overview

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login and get JWT tokens |
| POST | `/refresh` | Refresh access token |
| POST | `/logout` | Logout (invalidate token) |
| POST | `/forgot-password` | Request password reset |
| PUT | `/reset-password` | Reset password with token |

### Users (`/api/v1/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all users (Admin) |
| GET | `/{user_id}` | Get user profile |
| PUT | `/{user_id}` | Update user profile |
| DELETE | `/{user_id}` | Delete user (Admin) |
| GET | `/me` | Get current user profile |

### Courses (`/api/v1/courses`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all courses |
| POST | `/` | Create new course |
| GET | `/{course_id}` | Get course details |
| PUT | `/{course_id}` | Update course |
| DELETE | `/{course_id}` | Delete course |
| POST | `/{course_id}/enroll` | Enroll student in course |
| DELETE | `/{course_id}/unenroll` | Unenroll student |

### Assignments (`/api/v1/assignments`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List assignments (filtered by role) |
| POST | `/` | Create new assignment |
| GET | `/{assignment_id}` | Get assignment details |
| PUT | `/{assignment_id}` | Update assignment |
| DELETE | `/{assignment_id}` | Delete assignment |
| POST | `/{assignment_id}/submit` | Submit assignment |
| GET | `/{assignment_id}/submissions` | View all submissions (Professor) |
| PUT | `/submissions/{submission_id}/grade` | Grade submission |

### Grades (`/api/v1/grades`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/student/{student_id}` | Get student grades |
| POST | `/` | Save/update grade (Professor) |
| GET | `/course/{course_id}` | Get all grades for course |
| POST | `/publish` | Publish grades to students |
| GET | `/transcript/{student_id}` | Generate student transcript |

### Announcements (`/api/v1/announcements`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List announcements |
| POST | `/` | Create announcement |
| GET | `/{announcement_id}` | Get announcement details |
| PUT | `/{announcement_id}` | Update announcement |
| DELETE | `/{announcement_id}` | Delete announcement |
| POST | `/{announcement_id}/reply` | Reply to announcement |
| GET | `/{announcement_id}/replies` | Get all replies |

### Attendance (`/api/v1/attendance`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/session/generate` | Generate QR code session |
| POST | `/session/validate` | Validate QR code check-in |
| GET | `/course/{course_id}` | Get attendance records |
| POST | `/mark` | Manually mark attendance |
| GET | `/student/{student_id}` | Get student attendance history |

### Venues (`/api/v1/venues`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all venues |
| POST | `/` | Create new venue |
| GET | `/available` | Check venue availability |
| PUT | `/{venue_id}` | Update venue |
| DELETE | `/{venue_id}` | Delete venue |

### Timetable (`/api/v1/timetable`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get timetable (filtered by user) |
| POST | `/` | Create schedule entry |
| PUT | `/{schedule_id}` | Update schedule |
| DELETE | `/{schedule_id}` | Delete schedule |
| GET | `/conflicts` | Check scheduling conflicts |

---

## 🧪 Testing

Run all tests:

```bash
pytest
```

Run with coverage:

```bash
pytest --cov=app --cov-report=html
```

Run specific test file:

```bash
pytest tests/test_assignments.py -v
```

---

## 🐳 Docker Deployment

### Build and Run with Docker Compose

```bash
docker-compose up --build
```

This will start:
- FastAPI backend on port 8000
- PostgreSQL database on port 5432
- Redis cache on port 6379 (optional)

### Production Docker Commands

```bash
# Build production image
docker build -t campus-scheduler:latest .

# Run container
docker run -d -p 8000:8000 --env-file .env campus-scheduler:latest
```

---

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` files; use secrets management
2. **HTTPS Only**: Enforce SSL/TLS in production
3. **Rate Limiting**: Implement request throttling on auth endpoints
4. **Input Validation**: All inputs validated via Pydantic schemas
5. **SQL Injection Prevention**: SQLAlchemy ORM with parameterized queries
6. **CORS Configuration**: Restrict origins in production
7. **Token Expiration**: Short-lived access tokens with refresh rotation
8. **Password Policy**: Enforce minimum complexity requirements

---

## 📊 Database Schema Highlights

### Core Tables
- **users**: User accounts with roles and authentication
- **courses**: Course catalog with credits and prerequisites
- **venues**: Physical locations with capacity and amenities
- **timetable**: Class schedules linking courses, venues, and times

### Academic Tables
- **assignments**: Homework/projects with due dates and max scores
- **assignment_submissions**: Student submissions with files and grades
- **grades**: Student grades per course with GPA calculations
- **attendance**: Check-in records with QR session validation

### Communication Tables
- **announcements**: Course/institution broadcasts
- **announcement_replies**: Threaded discussion responses
- **qr_code_sessions**: Time-limited QR codes for attendance

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow PEP 8 style guidelines
- Write tests for new features
- Update documentation as needed
- Use meaningful commit messages

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors & Contributors

- **Core Team**: [Your University/Organization Name]
- **Lead Developer**: [Your Name]
- **Contributors**: See [GitHub Contributors](https://github.com/your-org/campus-scheduler/graphs/contributors)

---

## 🆘 Support & Contact

- **Documentation**: https://docs.campusscheduler.edu
- **Issue Tracker**: https://github.com/your-org/campus-scheduler/issues
- **Email**: support@campusscheduler.edu
- **Discord Community**: [Join our server](https://discord.gg/your-invite)

---

## 🗺️ Roadmap

### Q1 2025
- [ ] Mobile app integration (iOS/Android APIs)
- [ ] Advanced analytics dashboard
- [ ] Integration with LMS platforms (Canvas, Moodle, Blackboard)

### Q2 2025
- [ ] AI-powered timetable optimization
- [ ] Automated exam scheduling
- [ ] Parent portal for K-12 institutions

### Q3 2025
- [ ] Video conferencing integration (Zoom, Teams)
- [ ] Resource booking system (equipment, study rooms)
- [ ] Multi-language support

---

## 🙏 Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- Database design inspired by standard LMS architectures
- Icons from [FontAwesome](https://fontawesome.com/)
- Testing framework: [Pytest](https://docs.pytest.org/)

---

**Made with ❤️ for the Education Community**

*Last Updated: January 2025*
