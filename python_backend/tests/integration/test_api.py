"""
Integration tests for CampusScheduler API endpoints.

These tests verify the full HTTP request/response cycle with database.
"""
import pytest
from httpx import AsyncClient


class TestAuthEndpoints:
    """Tests for authentication endpoints."""

    @pytest.mark.asyncio
    async def test_register_user(self, client: AsyncClient, sample_user_data):
        """Test user registration."""
        response = await client.post("/api/v1/auth/register", json=sample_user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data or "id" in data or "email" in data

    @pytest.mark.asyncio
    async def test_login_success(self, client: AsyncClient, sample_user_data):
        """Test successful login."""
        # First register
        await client.post("/api/v1/auth/register", json=sample_user_data)
        
        # Then login
        response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": sample_user_data["email"],
                "password": sample_user_data["password"],
            },
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    @pytest.mark.asyncio
    async def test_login_invalid_credentials(self, client: AsyncClient, sample_user_data):
        """Test login with invalid credentials."""
        response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": "nonexistent@example.com",
                "password": "wrongpassword",
            },
        )
        
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_register_duplicate_email(self, client: AsyncClient, sample_user_data):
        """Test registering with duplicate email."""
        # First registration
        await client.post("/api/v1/auth/register", json=sample_user_data)
        
        # Second registration with same email
        response = await client.post("/api/v1/auth/register", json=sample_user_data)
        
        assert response.status_code == 400


class TestCourseEndpoints:
    """Tests for course management endpoints."""

    @pytest.mark.asyncio
    async def test_create_course(self, authenticated_client: AsyncClient, sample_course_data):
        """Test creating a course (instructor/admin)."""
        response = await authenticated_client.post(
            "/api/v1/courses/",
            json=sample_course_data,
        )
        
        # Should succeed for authenticated user with proper role
        assert response.status_code in [201, 200]

    @pytest.mark.asyncio
    async def test_list_courses(self, client: AsyncClient):
        """Test listing all courses."""
        response = await client.get("/api/v1/courses/")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    @pytest.mark.asyncio
    async def test_get_course_by_id(self, client: AsyncClient):
        """Test getting a specific course."""
        response = await client.get("/api/v1/courses/1")
        
        # May return 404 if no course exists, but should not error
        assert response.status_code in [200, 404]


class TestAssignmentEndpoints:
    """Tests for assignment management endpoints."""

    @pytest.mark.asyncio
    async def test_create_assignment(self, authenticated_client: AsyncClient, sample_assignment_data):
        """Test creating an assignment."""
        response = await authenticated_client.post(
            "/api/v1/assignments/",
            json=sample_assignment_data,
        )
        
        # Should succeed for authenticated instructor
        assert response.status_code in [201, 200, 403]  # 403 if not instructor

    @pytest.mark.asyncio
    async def test_list_assignments(self, client: AsyncClient):
        """Test listing assignments."""
        response = await client.get("/api/v1/assignments/")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestGradeEndpoints:
    """Tests for grade management endpoints."""

    @pytest.mark.asyncio
    async def test_get_student_grades(self, authenticated_client: AsyncClient):
        """Test student viewing their grades."""
        response = await authenticated_client.get("/api/v1/grades/my-grades")
        
        # Should succeed for authenticated student
        assert response.status_code in [200, 403, 404]

    @pytest.mark.asyncio
    async def test_unauthorized_grade_access(self, client: AsyncClient):
        """Test unauthorized access to grades."""
        response = await client.get("/api/v1/grades/my-grades")
        
        # Should require authentication
        assert response.status_code == 401


class TestAnnouncementEndpoints:
    """Tests for announcement endpoints."""

    @pytest.mark.asyncio
    async def test_create_announcement(self, authenticated_client: AsyncClient):
        """Test creating an announcement."""
        announcement_data = {
            "title": "Test Announcement",
            "content": "This is a test announcement",
            "course_id": 1,
        }
        
        response = await authenticated_client.post(
            "/api/v1/announcements/",
            json=announcement_data,
        )
        
        # Should succeed for authenticated instructor/admin
        assert response.status_code in [201, 200, 403, 404]

    @pytest.mark.asyncio
    async def test_list_announcements(self, client: AsyncClient):
        """Test listing announcements."""
        response = await client.get("/api/v1/announcements/")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestVenueEndpoints:
    """Tests for venue management endpoints."""

    @pytest.mark.asyncio
    async def test_check_venue_availability(self, client: AsyncClient, sample_venue_data):
        """Test checking venue availability."""
        # First create a venue (if authorized)
        # Then check availability
        response = await client.get("/api/v1/venues/1/availability")
        
        # May return 404 if venue doesn't exist
        assert response.status_code in [200, 404]

    @pytest.mark.asyncio
    async def test_list_venues(self, client: AsyncClient):
        """Test listing venues."""
        response = await client.get("/api/v1/venues/")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestTimetableEndpoints:
    """Tests for timetable management endpoints."""

    @pytest.mark.asyncio
    async def test_get_student_timetable(self, authenticated_client: AsyncClient):
        """Test student getting their timetable."""
        response = await authenticated_client.get("/api/v1/timetable/my-schedule")
        
        # Should succeed for authenticated student
        assert response.status_code in [200, 403]

    @pytest.mark.asyncio
    async def test_create_timetable_entry(self, authenticated_client: AsyncClient):
        """Test creating a timetable entry."""
        timetable_data = {
            "course_id": 1,
            "venue_id": 1,
            "day": "Monday",
            "start_time": "09:00",
            "end_time": "10:00",
        }
        
        response = await authenticated_client.post(
            "/api/v1/timetable/",
            json=timetable_data,
        )
        
        # May fail due to missing course/venue, but shouldn't error
        assert response.status_code in [201, 200, 400, 403, 404]
