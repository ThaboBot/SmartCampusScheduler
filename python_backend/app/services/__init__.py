"""
Services initialization module.
Exports all service components for easy importing.
"""
from app.services.email import email_service, EmailService
from app.services.qr_code import qr_service, QRCodeService
from app.services.analytics import AnalyticsService

__all__ = [
    "email_service",
    "EmailService",
    "qr_service",
    "QRCodeService",
    "AnalyticsService",
]
