# CampusScheduler Python Backend - Development Quick Start

## Prerequisites
- Docker & Docker Compose
- Python 3.11+ (for local development without Docker)

## Option 1: Docker Compose (Recommended)

### Start All Services
```bash
# Start app, database, and redis
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down
```

### Access Services
- **API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **pgAdmin**: http://localhost:5050 (email: admin@campusscheduler.local, password: adminpassword123)
- **Redis Commander**: http://localhost:8081

### Run Tests in Docker
```bash
docker-compose exec app pytest
```

## Option 2: Local Development

### Setup Environment
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt  # Optional: dev tools
```

### Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your settings
nano .env
```

### Initialize Database
```bash
# Run migrations
alembic upgrade head

# Create sample data (optional)
python scripts/init_db.py
```

### Run Application
```bash
# Development mode with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Run Tests
```bash
# All tests
pytest

# With coverage
pytest --cov=app --cov-report=html

# Specific test file
pytest tests/unit/test_services.py -v

# Integration tests only
pytest tests/integration/ -v
```

### Code Quality Checks
```bash
# Linting
ruff check app/ tests/

# Formatting
black app/ tests/
isort app/ tests/

# Type checking
mypy app/

# All checks at once
pre-commit run --all-files
```

## Database Management

### Create Migration
```bash
alembic revision --autogenerate -m "Description of changes"
```

### Apply Migrations
```bash
alembic upgrade head
```

### Rollback Migration
```bash
alembic downgrade -1
```

### View Migration History
```bash
alembic history
```

## Common Tasks

### Create Superuser
```bash
python scripts/init_db.py
```

### Reset Database
```bash
# Docker
docker-compose down -v
docker-compose up -d db
docker-compose exec app alembic upgrade head

# Local
rm -f campusscheduler.db
alembic upgrade head
python scripts/init_db.py
```

### View API Documentation
Open http://localhost:8000/docs in your browser

### Check Health
```bash
curl http://localhost:8000/health
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>
```

### Database Connection Error
```bash
# Check if database is running
docker-compose ps

# Restart database
docker-compose restart db

# Check database logs
docker-compose logs db
```

### Migration Issues
```bash
# Clear alembic version and re-migrate
docker-compose exec app alembic downgrade base
docker-compose exec app alembic upgrade head
```

## Next Steps

1. **Read the full README.md** for comprehensive documentation
2. **Review INDUSTRY_STANDARD_AUDIT.md** for compliance details
3. **Check API docs** at http://localhost:8000/docs
4. **Run the test suite** to verify everything works
5. **Start building features!**

---

For more information, see the full [README.md](README.md)
