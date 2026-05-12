"""
Custom exceptions for the application.
"""
from typing import Optional, Any, Dict


class AppExceptionCodes:
    """Standardized exception codes."""
    
    # Authentication (401)
    AUTH_INVALID_CREDENTIALS = "AUTH_INVALID_CREDENTIALS"
    AUTH_TOKEN_EXPIRED = "AUTH_TOKEN_EXPIRED"
    AUTH_TOKEN_INVALID = "AUTH_TOKEN_INVALID"
    AUTH_USER_NOT_FOUND = "AUTH_USER_NOT_FOUND"
    AUTH_USER_INACTIVE = "AUTH_USER_INACTIVE"
    
    # Authorization (403)
    AUTH_NOT_ENOUGH_PERMISSIONS = "AUTH_NOT_ENOUGH_PERMISSIONS"
    AUTH_ADMIN_REQUIRED = "AUTH_ADMIN_REQUIRED"
    AUTH_LECTURER_REQUIRED = "AUTH_LECTURER_REQUIRED"
    
    # Not Found (404)
    RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND"
    USER_NOT_FOUND = "USER_NOT_FOUND"
    COURSE_NOT_FOUND = "COURSE_NOT_FOUND"
    VENUE_NOT_FOUND = "VENUE_NOT_FOUND"
    CLASS_NOT_FOUND = "CLASS_NOT_FOUND"
    ASSIGNMENT_NOT_FOUND = "ASSIGNMENT_NOT_FOUND"
    SUBMISSION_NOT_FOUND = "SUBMISSION_NOT_FOUND"
    
    # Validation (400)
    VALIDATION_ERROR = "VALIDATION_ERROR"
    INVALID_INPUT = "INVALID_INPUT"
    DUPLICATE_ENTRY = "DUPLICATE_ENTRY"
    FILE_TOO_LARGE = "FILE_TOO_LARGE"
    INVALID_FILE_TYPE = "INVALID_FILE_TYPE"
    
    # Conflict (409)
    RESOURCE_CONFLICT = "RESOURCE_CONFLICT"
    VENUE_CONFLICT = "VENUE_CONFLICT"
    SCHEDULE_CONFLICT = "SCHEDULE_CONFLICT"
    ENROLLMENT_EXISTS = "ENROLLMENT_EXISTS"
    
    # Internal Server Error (500)
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR"
    DATABASE_ERROR = "DATABASE_ERROR"
    EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR"
    AI_SERVICE_ERROR = "AI_SERVICE_ERROR"


class AppException(Exception):
    """Base application exception."""
    
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


# Authentication Exceptions
class InvalidCredentialsException(AppException):
    def __init__(self, message: str = "Invalid email or password"):
        super().__init__(
            code=AppExceptionCodes.AUTH_INVALID_CREDENTIALS,
            message=message,
            status_code=401
        )


class TokenExpiredException(AppException):
    def __init__(self, message: str = "Token has expired"):
        super().__init__(
            code=AppExceptionCodes.AUTH_TOKEN_EXPIRED,
            message=message,
            status_code=401
        )


class TokenInvalidException(AppException):
    def __init__(self, message: str = "Invalid token"):
        super().__init__(
            code=AppExceptionCodes.AUTH_TOKEN_INVALID,
            message=message,
            status_code=401
        )


class UserNotFoundException(AppException):
    def __init__(self, message: str = "User not found"):
        super().__init__(
            code=AppExceptionCodes.USER_NOT_FOUND,
            message=message,
            status_code=404
        )


# Authorization Exceptions
class NotEnoughPermissionsException(AppException):
    def __init__(self, message: str = "Not enough permissions"):
        super().__init__(
            code=AppExceptionCodes.AUTH_NOT_ENOUGH_PERMISSIONS,
            message=message,
            status_code=403
        )


class AdminRequiredException(AppException):
    def __init__(self, message: str = "Admin access required"):
        super().__init__(
            code=AppExceptionCodes.AUTH_ADMIN_REQUIRED,
            message=message,
            status_code=403
        )


# Resource Exceptions
class ResourceNotFoundException(AppException):
    def __init__(self, resource_type: str = "Resource", message: Optional[str] = None):
        msg = message or f"{resource_type} not found"
        super().__init__(
            code=AppExceptionCodes.RESOURCE_NOT_FOUND,
            message=msg,
            status_code=404
        )


class CourseNotFoundException(ResourceNotFoundException):
    def __init__(self, message: str = "Course not found"):
        super().__init__(resource_type="Course", message=message)


class VenueNotFoundException(ResourceNotFoundException):
    def __init__(self, message: str = "Venue not found"):
        super().__init__(resource_type="Venue", message=message)


class ClassNotFoundException(ResourceNotFoundException):
    def __init__(self, message: str = "Class not found"):
        super().__init__(resource_type="Class", message=message)


class AssignmentNotFoundException(ResourceNotFoundException):
    def __init__(self, message: str = "Assignment not found"):
        super().__init__(resource_type="Assignment", message=message)


# Validation Exceptions
class ValidationException(AppException):
    def __init__(self, message: str = "Validation error", details: Optional[Dict] = None):
        super().__init__(
            code=AppExceptionCodes.VALIDATION_ERROR,
            message=message,
            status_code=400,
            details=details
        )


class DuplicateEntryException(AppException):
    def __init__(self, message: str = "Duplicate entry"):
        super().__init__(
            code=AppExceptionCodes.DUPLICATE_ENTRY,
            message=message,
            status_code=400
        )


# Conflict Exceptions
class VenueConflictException(AppException):
    def __init__(self, message: str = "Venue conflict detected"):
        super().__init__(
            code=AppExceptionCodes.VENUE_CONFLICT,
            message=message,
            status_code=409
        )


class ScheduleConflictException(AppException):
    def __init__(self, message: str = "Schedule conflict detected"):
        super().__init__(
            code=AppExceptionCodes.SCHEDULE_CONFLICT,
            message=message,
            status_code=409
        )


class EnrollmentExistsException(AppException):
    def __init__(self, message: str = "Already enrolled in this course"):
        super().__init__(
            code=AppExceptionCodes.ENROLLMENT_EXISTS,
            message=message,
            status_code=409
        )


# Service Exceptions
class DatabaseException(AppException):
    def __init__(self, message: str = "Database error occurred"):
        super().__init__(
            code=AppExceptionCodes.DATABASE_ERROR,
            message=message,
            status_code=500
        )


class AIServiceException(AppException):
    def __init__(self, message: str = "AI service error"):
        super().__init__(
            code=AppExceptionCodes.AI_SERVICE_ERROR,
            message=message,
            status_code=500
        )
