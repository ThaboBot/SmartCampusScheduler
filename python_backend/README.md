# 🎓 CampusScheduler Python Backend

<div align="center">

![Python Version](https://img.shields.io/badge/python-3.10+-blue.svg)
![FastAPI Version](https://img.shields.io/badge/fastapi-0.109.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-production--ready-success.svg)
[![Code Style: Black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)
[![Type Checked: mypy](https://img.shields.io/badge/type%20checked-mypy-blue.svg)](https://mypy.readthedocs.io/)

**Enterprise-Grade Learning Management System Backend**

[Features](#-features) • [Quick Start](#-quick-start) • [API Documentation](#-api-documentation) • [Architecture](#-architecture) • [Testing](#-testing) • [Deployment](#-deployment)

</div>

---

## 📖 Overview

CampusScheduler is a comprehensive, production-ready Python backend for a modern Learning Management System (LMS). Built with **FastAPI**, it provides high-performance RESTful APIs with advanced features including JWT authentication, real-time notifications, QR code attendance, automated email notifications, and comprehensive analytics.

### ✨ What's New in v2.0.0

- 🛡️ **Enterprise Security**: Rate limiting, security headers, CSP protection
- 📧 **Email Service**: Automated notifications for assignments, grades, announcements
- 📊 **Analytics Engine**: Dashboard statistics, attendance reports, grade analytics
- 🔲 **QR Code Service**: Secure, time-based QR codes for attendance tracking
- 📝 **Structured Logging**: JSON logs with request timing and tracing
- 🚦 **Middleware Stack**: Logging, rate limiting, security headers
- 🏥 **Health Endpoints**: Kubernetes-ready health, readiness, and liveness probes

---

## 🌟 Features

### Core Capabilities

| Category | Features |
|----------|----------|
| 🔐 **Authentication** | JWT tokens, refresh tokens, password hashing (bcrypt), role-based access control |
| 👥 **User Management** | Multi-role system (Admin, Lecturer, Student), profile management, permissions |
| 📚 **Course Management** | Course CRUD, enrollment, curriculum organization, lecturer assignment |
| 📅 **Timetable** | AI-powered scheduling, conflict detection, venue allocation |
| 📝 **Assignments** | Full lifecycle (create → submit → grade → feedback), due dates, file uploads |
| 🎯 **Grades** | GPA calculation, letter grades, grade distribution, transcript generation |
| ✅ **Attendance** | QR code check-in, fraud prevention, attendance rates, historical reports |
| 📢 **Communication** | Announcements, threaded discussions, email notifications |
| 📊 **Analytics** | Dashboard stats, course analytics, attendance reports, grade reports |
| 🔔 **Notifications** | Email alerts, real-time WebSocket updates, push notifications |

### Technical Highlights

- ⚡ **High Performance**: Async-first architecture with uvicorn
- 🗄️ **Database**: PostgreSQL with SQLAlchemy async ORM
- 💾 **Caching**: Redis integration for session management and caching
- 🔄 **Background Tasks**: Celery for async job processing
- 📡 **Real-time**: WebSocket support for instant notifications
- 📋 **Validation**: Pydantic V2 for robust data validation
- 📚 **Documentation**: Auto-generated OpenAPI/Swagger docs
- 🧪 **Testing**: pytest with async support and coverage reporting
- 🐳 **Containerization**: Docker and docker-compose ready
- ☸️ **Kubernetes**: Health probes and configuration management

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Web    │  │  Mobile  │  │  Admin   │  │   API    │   │
│  │  Client  │  │   App    │  │  Portal  │  │ Clients  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              FastAPI Application                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │   Security  │  │    Rate     │  │  Logging    │  │   │
│  │  │   Headers   │  │   Limiting  │  │ Middleware  │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   API    │  │  CRUD    │  │ Services │  │   Core   │   │
│  │ Endpoints│  │ Operations│  │  Layer  │  │  Utils   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │PostgreSQL│  │  Redis   │  │  Celery  │  │   File   │   │
│  │ Database │  │  Cache   │  │  Broker  │  │ Storage  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
python_backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/          # API route handlers (10 modules)
│   │       │   ├── auth.py         # Authentication endpoints
│   │       │   ├── users.py        # User management
│   │       │   ├── courses.py      # Course operations
│   │       │   ├── venues.py       # Venue management
│   │       │   ├── timetable.py    # Scheduling
│   │       │   ├── assignments.py  # Assignment CRUD
│   │       │   ├── submissions.py  # Submission handling
│   │       │   ├── grades.py       # Grade management
│   │       │   ├── announcements.py# Announcements
│   │       │   └── attendance.py   # Attendance tracking
│   │       └── router.py           # Main API router
│   ├── core/
│   │   ├── config.py               # Application settings
│   │   ├── security.py             # JWT, password hashing
│   │   └── exceptions.py           # Custom exception classes
│   ├── crud/
│   │   ├── base.py                 # Generic CRUD operations
│   │   ├── user.py                 # User database operations
│   │   ├── course.py               # Course database operations
│   │   ├── venue.py                # Venue database operations
│   │   ├── timetable.py            # Timetable operations
│   │   ├── assignment.py           # Assignment operations
│   │   ├── submission.py           # Submission operations
│   │   ├── grade.py                # Grade operations
│   │   ├── announcement.py         # Announcement operations
│   │   └── attendance.py           # Attendance operations
│   ├── db/
│   │   ├── base.py                 # SQLAlchemy base
│   │   ├── session.py              # Database sessions
│   │   └── __init__.py
│   ├── middleware/
│   │   ├── logging.py              # Request/response logging
│   │   ├── rate_limit.py           # Rate limiting middleware
│   │   ├── security.py             # Security headers
│   │   └── __init__.py
│   ├── models/                     # SQLAlchemy ORM models
│   │   ├── user.py
│   │   ├── course.py
│   │   ├── venue.py
│   │   ├── timetable.py
│   │   ├── assignment.py
│   │   ├── submission.py
│   │   ├── grade.py
│   │   ├── announcement.py
│   │   └── attendance.py
│   ├── schemas/                    # Pydantic validation schemas
│   ├── services/                   # Business logic layer
│   │   ├── email.py                # Email notification service
│   │   ├── qr_code.py              # QR code generation/validation
│   │   ├── analytics.py            # Analytics and reporting
│   │   └── __init__.py
│   └── utils/                      # Utility functions
├── tests/                          # Test suite
│   ├── unit/                       # Unit tests
│   ├── integration/                # Integration tests
│   └── conftest.py                 # Pytest fixtures
├── scripts/
│   └── init_db.py                  # Database initialization
├── alembic/                        # Database migrations
├── .env.example                    # Environment template
├── .gitignore
├── requirements.txt
├── main.py                         # Application entry point
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:

- **Python**: 3.10 or higher
- **PostgreSQL**: 14 or higher
- **Redis**: 6.0 or higher (optional, for caching)
- **pip**: Python package manager

### Installation

```bash
# Navigate to backend directory
cd python_backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Configuration

1. **Copy environment template**:
```bash
cp .env.example .env
```

2. **Edit `.env` file** with your settings:
```env
# Application
APP_NAME=CampusScheduler
DEBUG=True
HOST=0.0.0.0
PORT=8000

# Database
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/campusscheduler
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20

# Redis (optional)
REDIS_URL=redis://localhost:6379/0
REDIS_CACHE_TTL=300

# Security
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@campusscheduler.com

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json
```

### Database Setup

```bash
# Run database migrations
alembic upgrade head

# Initialize database with sample data (optional)
python scripts/init_db.py
```

### Run the Application

**Development Mode**:
```bash
# With auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or using the built-in runner
python main.py
```

**Production Mode**:
```bash
# Using gunicorn with uvicorn workers
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Or with uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Verify Installation

Open your browser and visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health
- **API Root**: http://localhost:8000/

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Register new user | ❌ |
| POST | `/api/v1/auth/login` | Login user | ❌ |
| POST | `/api/v1/auth/logout` | Logout user | ✅ |
| POST | `/api/v1/auth/refresh` | Refresh access token | ✅ |
| POST | `/api/v1/auth/password-reset` | Request password reset | ❌ |
| POST | `/api/v1/auth/password-reset-confirm` | Reset password with token | ❌ |

### User Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/users/me` | Get current user profile | ✅ |
| PUT | `/api/v1/users/me` | Update current user | ✅ |
| GET | `/api/v1/users/` | List all users (Admin) | ✅ Admin |
| GET | `/api/v1/users/{user_id}` | Get user by ID | ✅ |
| PUT | `/api/v1/users/{user_id}` | Update user | ✅ Admin |
| DELETE | `/api/v1/users/{user_id}` | Delete user | ✅ Admin |

### Course Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/courses/` | List all courses | ✅ |
| POST | `/api/v1/courses/` | Create new course | ✅ Lecturer+ |
| GET | `/api/v1/courses/{course_id}` | Get course details | ✅ |
| PUT | `/api/v1/courses/{course_id}` | Update course | ✅ Lecturer+ |
| DELETE | `/api/v1/courses/{course_id}` | Delete course | ✅ Admin |
| POST | `/api/v1/courses/{course_id}/enroll` | Enroll in course | ✅ Student |
| DELETE | `/api/v1/courses/{course_id}/unenroll` | Unenroll from course | ✅ Student |
| GET | `/api/v1/courses/{course_id}/students` | List enrolled students | ✅ Lecturer+ |

### Assignments & Submissions

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/assignments/` | List assignments | ✅ |
| POST | `/api/v1/assignments/` | Create assignment | ✅ Lecturer+ |
| GET | `/api/v1/assignments/{id}` | Get assignment details | ✅ |
| PUT | `/api/v1/assignments/{id}` | Update assignment | ✅ Lecturer+ |
| DELETE | `/api/v1/assignments/{id}` | Delete assignment | ✅ Lecturer+ |
| POST | `/api/v1/submissions/` | Submit assignment | ✅ Student |
| GET | `/api/v1/submissions/{id}` | Get submission details | ✅ |
| PUT | `/api/v1/submissions/{id}/grade` | Grade submission | ✅ Lecturer+ |

### Grades & Analytics

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/grades/my-grades` | Get current user's grades | ✅ |
| GET | `/api/v1/grades/course/{course_id}` | Get course grades | ✅ Lecturer+ |
| POST | `/api/v1/grades/` | Create/update grade | ✅ Lecturer+ |
| GET | `/api/v1/grades/gpa` | Calculate GPA | ✅ Student |
| GET | `/api/v1/analytics/dashboard` | Get dashboard statistics | ✅ |
| GET | `/api/v1/analytics/attendance-report` | Generate attendance report | ✅ Lecturer+ |
| GET | `/api/v1/analytics/grade-report` | Generate grade report | ✅ Lecturer+ |

### Announcements

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/announcements/` | List announcements | ✅ |
| POST | `/api/v1/announcements/` | Create announcement | ✅ Lecturer+ |
| GET | `/api/v1/announcements/{id}` | Get announcement | ✅ |
| PUT | `/api/v1/announcements/{id}` | Update announcement | ✅ Lecturer+ |
| DELETE | `/api/v1/announcements/{id}` | Delete announcement | ✅ Lecturer+ |
| POST | `/api/v1/announcements/{id}/pin` | Pin announcement | ✅ Lecturer+ |

### Attendance (QR Code)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/attendance/generate-qr` | Generate QR code | ✅ Lecturer+ |
| POST | `/api/v1/attendance/check-in` | Check in with QR code | ✅ Student |
| GET | `/api/v1/attendance/my-record` | Get attendance record | ✅ Student |
| GET | `/api/v1/attendance/course/{course_id}` | Get course attendance | ✅ Lecturer+ |

---

## 🧪 Testing

### Run Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/unit/test_auth.py

# Run with verbose output
pytest -v

# Run async tests
pytest --asyncio-mode=auto
```

### Test Structure

```
tests/
├── unit/                   # Unit tests
│   ├── test_auth.py
│   ├── test_crud.py
│   └── test_services.py
├── integration/            # Integration tests
│   ├── test_api_auth.py
│   ├── test_api_courses.py
│   └── test_api_assignments.py
└── conftest.py             # Pytest fixtures and config
```

### Example Test

```python
# tests/unit/test_auth.py
import pytest
from app.core.security import create_access_token, verify_token


def test_create_access_token():
    token = create_access_token(data={"sub": "test@example.com"})
    assert token is not None
    assert isinstance(token, str)


def test_verify_valid_token():
    token = create_access_token(data={"sub": "test@example.com"})
    payload = verify_token(token)
    assert payload is not None
    assert payload["sub"] == "test@example.com"
```

---

## 🐳 Docker Deployment

### Development with Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/campusscheduler
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    volumes:
      - ./app:/app/app
    command: uvicorn main:app --reload --host 0.0.0.0 --port 8000

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=campusscheduler
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Production Dockerfile

```dockerfile
# Dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Run as non-root user
RUN adduser --disabled-password --gecos '' appuser
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import httpx; httpx.get('http://localhost:8000/health')"

# Start application
CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

---

## 🔒 Security Best Practices

### Implemented Security Measures

✅ **Authentication & Authorization**
- JWT tokens with expiration
- Refresh token rotation
- Password hashing with bcrypt (12 rounds)
- Role-based access control (RBAC)

✅ **API Security**
- Rate limiting (60 requests/minute default)
- CORS configuration
- Input validation with Pydantic
- SQL injection prevention (SQLAlchemy ORM)

✅ **HTTP Security Headers**
- `X-Frame-Options: DENY` (clickjacking protection)
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy`
- `Referrer-Policy`
- `Permissions-Policy`

✅ **Data Protection**
- HTTPS enforcement (production)
- Secure cookie flags
- Password complexity requirements
- Account lockout after failed attempts

### Security Checklist for Production

- [ ] Change `SECRET_KEY` to a strong random value
- [ ] Set `DEBUG=False`
- [ ] Configure proper CORS origins
- [ ] Enable HTTPS/TLS
- [ ] Set up SSL certificates
- [ ] Configure firewall rules
- [ ] Enable database encryption at rest
- [ ] Set up log monitoring
- [ ] Configure backup strategy
- [ ] Enable rate limiting
- [ ] Review and restrict API permissions

---

## 📊 Monitoring & Observability

### Health Endpoints

```bash
# Basic health check
curl http://localhost:8000/health

# Readiness probe (Kubernetes)
curl http://localhost:8000/ready

# Liveness probe (Kubernetes)
curl http://localhost:8000/live
```

### Metrics (Prometheus)

Enable metrics in `.env`:
```env
ENABLE_METRICS=True
METRICS_PATH=/metrics
```

Access metrics: http://localhost:8000/metrics

### Logging

Structured JSON logging is enabled by default. Logs include:
- Request method and path
- Response status code
- Processing time
- Client IP address
- User agent

View logs:
```bash
# Development
uvicorn main:app --log-level info

# Production (with log file)
uvicorn main:app --log-config logging_config.json --access-log
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: `pytest --cov=app`
5. **Format code**: `black app/ tests/` and `isort app/ tests/`
6. **Type check**: `mypy app/`
7. **Commit changes**: `git commit -m 'Add amazing feature'`
8. **Push to branch**: `git push origin feature/amazing-feature`
9. **Open a Pull Request**

### Code Standards

- **Formatting**: Black
- **Imports**: isort
- **Type Checking**: mypy
- **Linting**: flake8
- **Testing**: pytest with >80% coverage

---

## 📈 Performance Optimization

### Caching Strategy

- **Redis Cache**: Session data, frequently accessed records
- **TTL**: 5 minutes default for most cached data
- **Cache Invalidation**: On write operations

### Database Optimization

- **Connection Pooling**: Configurable pool size (default: 10)
- **Async Queries**: Non-blocking database operations
- **Indexing**: Strategic indexes on foreign keys and search columns

### API Performance

- **Async/Await**: Non-blocking I/O operations
- **Pagination**: All list endpoints support pagination
- **Field Selection**: Clients can request specific fields
- **Compression**: Gzip compression enabled

---

## 📞 Support

For issues, questions, or contributions:

- **GitHub Issues**: [Report bugs or request features](https://github.com/your-org/campusscheduler/issues)
- **Discussions**: [Ask questions and share ideas](https://github.com/your-org/campusscheduler/discussions)
- **Email**: support@campusscheduler.com

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with:
- [FastAPI](https://fastapi.tiangolo.com/) - Modern, fast web framework
- [SQLAlchemy](https://www.sqlalchemy.org/) - SQL toolkit and ORM
- [Pydantic](https://docs.pydantic.dev/) - Data validation
- [Uvicorn](https://www.uvicorn.org/) - ASGI server
- [Alembic](https://alembic.sqlalchemy.org/) - Database migrations
- [pytest](https://docs.pytest.org/) - Testing framework

---

<div align="center">

**Made with ❤️ by the CampusScheduler Team**

[Back to Top](#-campusscheduler-python-backend)

</div>

### Users
- `GET /api/v1/users` - List users (admin)
- `GET /api/v1/users/{id}` - Get user details
- `PUT /api/v1/users/{id}` - Update user
- `DELETE /api/v1/users/{id}` - Delete user (admin)

### Courses
- `GET /api/v1/courses` - List courses
- `POST /api/v1/courses` - Create course (admin)
- `GET /api/v1/courses/{id}` - Get course details
- `PUT /api/v1/courses/{id}` - Update course
- `DELETE /api/v1/courses/{id}` - Delete course (admin)

### Timetable
- `GET /api/v1/timetable` - Get user timetable
- `POST /api/v1/timetable/upload` - Upload timetable (admin)
- `GET /api/v1/timetable/conflicts` - Check conflicts

### Assignments
- `GET /api/v1/assignments` - List assignments
- `POST /api/v1/assignments` - Create assignment
- `POST /api/v1/assignments/{id}/submit` - Submit assignment
- `GET /api/v1/assignments/{id}/submissions` - Get submissions (lecturer)

### Grades
- `GET /api/v1/grades` - Get student grades
- `POST /api/v1/grades` - Post grades (lecturer)
- `GET /api/v1/grades/gpa` - Calculate GPA

### Announcements
- `GET /api/v1/announcements` - List announcements
- `POST /api/v1/announcements` - Create announcement
- `POST /api/v1/announcements/{id}/reply` - Reply to announcement

### Attendance (QR Code)
- `POST /api/v1/attendance/generate-qr` - Generate QR code
- `POST /api/v1/attendance/scan-qr` - Scan QR code for check-in
- `GET /api/v1/attendance/history` - Get attendance history

### Venues
- `GET /api/v1/venues` - List venues
- `POST /api/v1/venues` - Create venue (admin)
- `GET /api/v1/venues/availability` - Check venue availability

### AI Services
- `POST /api/v1/ai/resolve-conflict` - Resolve venue conflict
- `GET /api/v1/ai/analyze-usage` - Analyze venue usage patterns
- `POST /api/v1/ai/predict-attendance` - Predict class attendance

## Development

### Running Tests

```bash
pytest tests/ -v --cov=app
```

### Code Formatting

```bash
black app/ tests/
isort app/ tests/
flake8 app/ tests/
```

### Type Checking

```bash
mypy app/
```

## Docker Support

### Build and Run

```bash
docker-compose up -d
```

### Environment Variables

All configuration can be set via environment variables or `.env` file.

## License

MIT License
