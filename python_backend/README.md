# CampusScheduler Python Backend

Modern Python backend for CampusScheduler using FastAPI, providing RESTful APIs and enhanced features.

## Features

- **FastAPI Framework**: High-performance async API framework
- **SQLAlchemy ORM**: Database abstraction with async support
- **Pydantic V2**: Data validation and serialization
- **JWT Authentication**: Secure token-based authentication
- **Alembic Migrations**: Database schema versioning
- **Redis Cache**: Performance optimization
- **Celery Tasks**: Background job processing
- **WebSocket Support**: Real-time notifications
- **OpenAPI Documentation**: Auto-generated API docs

## Project Structure

```
python_backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/      # API route handlers
│   │       └── deps.py         # Dependencies
│   ├── core/
│   │   ├── config.py           # Configuration settings
│   │   ├── security.py         # Security utilities
│   │   └── exceptions.py       # Custom exceptions
│   ├── db/
│   │   ├── base.py             # Database base class
│   │   ├── session.py          # Database sessions
│   │   └── init_db.py          # Database initialization
│   ├── models/                 # SQLAlchemy models
│   ├── schemas/                # Pydantic schemas
│   ├── services/               # Business logic services
│   └── utils/                  # Utility functions
├── tests/                      # Test files
├── scripts/                    # Utility scripts
├── alembic/                    # Migration scripts
├── requirements.txt
└── main.py                     # Application entry point
```

## Quick Start

### Prerequisites

- Python 3.10+
- PostgreSQL 14+
- Redis (optional, for caching)

### Installation

```bash
cd python_backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Configuration

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/campusscheduler
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=True
```

### Run the Application

```bash
# Initialize database
alembic upgrade head

# Start development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production server
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### API Documentation

Once running, access:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user

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
