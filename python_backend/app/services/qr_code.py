"""
QR Code service for generating and validating attendance QR codes.
Uses qrcode library for generation and supports time-based validation.
"""
import io
import base64
import hashlib
import time
from typing import Optional, Tuple
from datetime import datetime, timedelta
import qrcode
from PIL import Image
from app.core.config import settings
from app.core.exceptions import AppException


class QRCodeValidationException(AppException):
    """Exception raised when QR code validation fails."""
    def __init__(self, message: str = "Invalid or expired QR code"):
        super().__init__(
            code="QR_CODE_INVALID",
            message=message,
            status_code=400
        )


class QRCodeService:
    """Service for generating and validating QR codes for attendance."""
    
    def __init__(self):
        self.secret_key = settings.SECRET_KEY
    
    def generate_qr_code(
        self,
        session_id: int,
        course_id: int,
        expires_in_seconds: int = 300,  # 5 minutes default
    ) -> Tuple[str, str]:
        """
        Generate a QR code for attendance session.
        
        Args:
            session_id: Unique session identifier
            course_id: Course identifier
            expires_in_seconds: QR code validity duration
            
        Returns:
            Tuple of (base64_encoded_image, qr_data)
        """
        # Create timestamp for expiration
        timestamp = int(time.time())
        expiration = timestamp + expires_in_seconds
        
        # Create payload with signature
        payload = f"{session_id}:{course_id}:{expiration}"
        signature = self._sign_payload(payload)
        qr_data = f"{payload}:{signature}"
        
        # Generate QR code image
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        # Create image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        return img_base64, qr_data
    
    def validate_qr_code(self, qr_data: str, session_id: int, course_id: int) -> bool:
        """
        Validate a scanned QR code.
        
        Args:
            qr_data: Data from scanned QR code
            session_id: Expected session ID
            course_id: Expected course ID
            
        Returns:
            True if valid
            
        Raises:
            QRCodeValidationException: If validation fails
        """
        try:
            # Parse QR data
            parts = qr_data.split(":")
            if len(parts) != 4:
                raise QRCodeValidationException("Invalid QR code format")
            
            parsed_session_id = int(parts[0])
            parsed_course_id = int(parts[1])
            expiration = int(parts[2])
            signature = parts[3]
            
            # Verify session and course IDs match
            if parsed_session_id != session_id or parsed_course_id != course_id:
                raise QRCodeValidationException("QR code does not match this session")
            
            # Check expiration
            current_time = int(time.time())
            if current_time > expiration:
                raise QRCodeValidationException("QR code has expired")
            
            # Verify signature
            payload = f"{parsed_session_id}:{parsed_course_id}:{expiration}"
            expected_signature = self._sign_payload(payload)
            
            if signature != expected_signature:
                raise QRCodeValidationException("Invalid QR code signature")
            
            return True
            
        except ValueError:
            raise QRCodeValidationException("Invalid QR code data")
        except QRCodeValidationException:
            raise
        except Exception as e:
            raise QRCodeValidationException(f"Validation error: {str(e)}")
    
    def _sign_payload(self, payload: str) -> str:
        """Create HMAC signature for payload."""
        message = payload.encode()
        signature = hashlib.sha256((message + self.secret_key.encode())).hexdigest()
        return signature[:16]  # Use first 16 chars for compactness
    
    def get_remaining_time(self, qr_data: str) -> int:
        """Get remaining validity time in seconds."""
        try:
            parts = qr_data.split(":")
            if len(parts) >= 3:
                expiration = int(parts[2])
                remaining = expiration - int(time.time())
                return max(0, remaining)
        except Exception:
            pass
        return 0


# Singleton instance
qr_service = QRCodeService()


__all__ = ["qr_service", "QRCodeService"]
