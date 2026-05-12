"""
Pytest configuration and shared fixtures for CampusScheduler tests.

This module provides:
- Database test session management
- Test client with authentication helpers
- Mock services for external dependencies
- Sample data factories
"""
import asyncio
from typing import AsyncGenerator, Generator
from unittest.mock import AsyncMock, MagicMock

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import get_db_session
from app.core.config import settings
from main import app

# Test database URL (in-memory SQLite for fast unit tests)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create an instance of the default event loop for each test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def test_engine():
    """Create a test database engine."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False,
    )
    
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    # Drop all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def test_db(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create a test database session for each test function."""
    async_session = async_sessionmaker(
        bind=test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )
    
    session = async_session()
    
    try:
        yield session
    finally:
        await session.close()


@pytest_asyncio.fixture(scope="function")
async def client(test_db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create a test HTTP client with overridden database dependency."""
    
    async def override_get_db():
        try:
            yield test_db
        finally:
            pass
    
    app.dependency_overrides[get_db_session] = override_get_db
    
    transport = ASGITransport(app=app)
    async_client = AsyncClient(
        transport=transport,
        base_url="http://test",
        headers={"Content-Type": "application/json"},
    )
    
    try:
        yield async_client
    finally:
        await async_client.aclose()
        app.dependency_overrides.clear()


@pytest.fixture
def mock_redis() -> MagicMock:
    """Create a mock Redis client."""
    mock = MagicMock()
    mock.redis = AsyncMock()
    mock.redis.get = AsyncMock(return_value=None)
    mock.redis.set = AsyncMock(return_value=True)
    mock.redis.delete = AsyncMock(return_value=True)
    mock.redis.exists = AsyncMock(return_value=False)
    return mock


@pytest.fixture
def mock_email_service() -> MagicMock:
    """Create a mock email service."""
    mock = MagicMock()
    mock.send_email = AsyncMock(return_value=True)
    mock.send_password_reset = AsyncMock(return_value=True)
    mock.send_welcome = AsyncMock(return_value=True)
    return mock


@pytest.fixture
def sample_user_data():
    """Factory for sample user data."""
    return {
        "email": "test@example.com",
        "password": "TestPassword123!",
        "first_name": "Test",
        "last_name": "User",
        "role": "student",
    }


@pytest.fixture
def sample_course_data():
    """Factory for sample course data."""
    return {
        "code": "CS101",
        "name": "Introduction to Computer Science",
        "description": "Basic computer science concepts",
        "credits": 3,
        "semester": "Fall 2025",
    }


@pytest.fixture
def sample_venue_data():
    """Factory for sample venue data."""
    return {
        "name": "Room 101",
        "building": "Science Building",
        "capacity": 50,
        "type": "classroom",
    }


@pytest.fixture
def sample_assignment_data():
    """Factory for sample assignment data."""
    return {
        "title": "First Assignment",
        "description": "Complete chapters 1-3",
        "due_date": "2025-12-01T23:59:59",
        "max_score": 100,
        "course_id": 1,
    }


@pytest.fixture
def auth_headers(sample_user_data) -> dict:
    """Helper to create authentication headers (requires valid token)."""
    # This would need a valid JWT token from login
    # For now, returns empty dict - tests should login first
    return {}


@pytest_asyncio.fixture
async def authenticated_client(client: AsyncClient, sample_user_data) -> AsyncClient:
    """Create an authenticated test client."""
    # Register user
    await client.post("/api/v1/auth/register", json=sample_user_data)
    
    # Login
    response = await client.post(
        "/api/v1/auth/login",
        data={
            "username": sample_user_data["email"],
            "password": sample_user_data["password"],
        },
    )
    
    if response.status_code == 200:
        tokens = response.json()
        access_token = tokens.get("access_token")
        client.headers["Authorization"] = f"Bearer {access_token}"
    
    return client
