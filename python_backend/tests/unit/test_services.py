"""
Unit tests for CampusScheduler services.

These tests verify business logic without database or HTTP dependencies.
"""
import pytest
from datetime import datetime, timedelta

from app.services.gpa_calculator import calculate_gpa, calculate_letter_grade
from app.services.schedule_conflict_detector import has_conflict
from app.services.rbac import check_permission, Permission


class TestGPACalculator:
    """Tests for GPA calculation service."""

    def test_calculate_gpa_perfect_scores(self):
        """Test GPA calculation with perfect scores."""
        grades = [
            {"grade": "A", "credits": 3},
            {"grade": "A", "credits": 3},
            {"grade": "A", "credits": 3},
        ]
        gpa = calculate_gpa(grades)
        assert gpa == 4.0

    def test_calculate_gpa_mixed_scores(self):
        """Test GPA calculation with mixed scores."""
        grades = [
            {"grade": "A", "credits": 3},
            {"grade": "B", "credits": 3},
            {"grade": "C", "credits": 3},
        ]
        gpa = calculate_gpa(grades)
        assert gpa == pytest.approx(3.0, rel=0.01)

    def test_calculate_gpa_weighted_by_credits(self):
        """Test that GPA is weighted by credit hours."""
        grades = [
            {"grade": "A", "credits": 4},  # 4.0 * 4 = 16
            {"grade": "F", "credits": 1},  # 0.0 * 1 = 0
        ]
        gpa = calculate_gpa(grades)
        # (16 + 0) / 5 = 3.2
        assert gpa == pytest.approx(3.2, rel=0.01)

    def test_calculate_gpa_empty_grades(self):
        """Test GPA calculation with no grades."""
        gpa = calculate_gpa([])
        assert gpa == 0.0

    def test_letter_grade_a_range(self):
        """Test letter grade boundaries for A."""
        assert calculate_letter_grade(95) == "A"
        assert calculate_letter_grade(90) == "A"

    def test_letter_grade_b_range(self):
        """Test letter grade boundaries for B."""
        assert calculate_letter_grade(85) == "B"
        assert calculate_letter_grade(80) == "B"

    def test_letter_grade_f(self):
        """Test failing grade."""
        assert calculate_letter_grade(59) == "F"


class TestScheduleConflictDetector:
    """Tests for schedule conflict detection."""

    def test_no_conflict_different_days(self):
        """Test schedules on different days have no conflict."""
        schedule1 = {
            "day": "Monday",
            "start_time": "09:00",
            "end_time": "10:00",
        }
        schedule2 = {
            "day": "Tuesday",
            "start_time": "09:00",
            "end_time": "10:00",
        }
        assert not has_conflict(schedule1, schedule2)

    def test_conflict_same_time_same_day(self):
        """Test overlapping times on same day conflict."""
        schedule1 = {
            "day": "Monday",
            "start_time": "09:00",
            "end_time": "10:00",
        }
        schedule2 = {
            "day": "Monday",
            "start_time": "09:30",
            "end_time": "10:30",
        }
        assert has_conflict(schedule1, schedule2)

    def test_no_conflict_adjacent_times(self):
        """Test adjacent time slots don't conflict."""
        schedule1 = {
            "day": "Monday",
            "start_time": "09:00",
            "end_time": "10:00",
        }
        schedule2 = {
            "day": "Monday",
            "start_time": "10:00",
            "end_time": "11:00",
        }
        assert not has_conflict(schedule1, schedule2)

    def test_conflict_contained_time(self):
        """Test when one schedule is contained within another."""
        schedule1 = {
            "day": "Monday",
            "start_time": "09:00",
            "end_time": "11:00",
        }
        schedule2 = {
            "day": "Monday",
            "start_time": "09:30",
            "end_time": "10:30",
        }
        assert has_conflict(schedule1, schedule2)


class TestRBAC:
    """Tests for role-based access control."""

    def test_admin_has_all_permissions(self):
        """Test admin role has all permissions."""
        assert check_permission("admin", Permission.DELETE_USER)
        assert check_permission("admin", Permission.EDIT_GRADES)
        assert check_permission("admin", Permission.CREATE_COURSE)

    def test_instructor_can_edit_grades(self):
        """Test instructor can edit grades."""
        assert check_permission("instructor", Permission.EDIT_GRADES)
        assert check_permission("instructor", Permission.CREATE_ASSIGNMENT)

    def test_student_cannot_edit_grades(self):
        """Test student cannot edit grades."""
        assert not check_permission("student", Permission.EDIT_GRADES)
        assert not check_permission("student", Permission.DELETE_USER)

    def test_student_can_view_grades(self):
        """Test student can view their own grades."""
        assert check_permission("student", Permission.VIEW_GRADES)

    def test_invalid_role_denied(self):
        """Test invalid roles are denied."""
        assert not check_permission("invalid_role", Permission.VIEW_GRADES)
