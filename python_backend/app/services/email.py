"""
Email service for sending notifications and transactional emails.
Supports SMTP with TLS encryption.
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
from app.core.config import settings
from app.core.exceptions import AppException


class EmailServiceException(AppException):
    """Exception raised when email sending fails."""
    def __init__(self, message: str = "Failed to send email"):
        super().__init__(
            code="EMAIL_SEND_FAILED",
            message=message,
            status_code=500
        )


class EmailService:
    """Service for sending emails via SMTP."""
    
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_username = settings.SMTP_USERNAME
        self.smtp_password = settings.SMTP_PASSWORD
        self.email_from = settings.EMAIL_FROM
    
    async def send_email(
        self,
        to: str | List[str],
        subject: str,
        body: str,
        html: bool = False,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None,
        reply_to: Optional[str] = None,
    ) -> bool:
        """
        Send an email to one or more recipients.
        
        Args:
            to: Recipient email address(es)
            subject: Email subject
            body: Email body content
            html: Whether body is HTML (default: False)
            cc: CC recipients
            bcc: BCC recipients
            reply_to: Reply-To address
            
        Returns:
            True if email sent successfully
            
        Raises:
            EmailServiceException: If sending fails
        """
        if not self.smtp_username or not self.smtp_password:
            # Skip actual sending if not configured (development mode)
            print(f"[EMAIL] Would send to {to}: {subject}")
            return True
        
        try:
            # Create message
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.email_from
            
            # Handle multiple recipients
            if isinstance(to, str):
                to = [to]
            msg["To"] = ", ".join(to)
            
            if cc:
                msg["Cc"] = ", ".join(cc)
                to.extend(cc)
            
            if reply_to:
                msg["Reply-To"] = reply_to
            
            # Attach body
            mime_type = "html" if html else "plain"
            msg.attach(MIMEText(body, mime_type))
            
            # Connect and send
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.sendmail(self.email_from, to, msg.as_string())
            
            print(f"[EMAIL] Sent to {to}: {subject}")
            return True
            
        except Exception as e:
            raise EmailServiceException(f"SMTP error: {str(e)}")
    
    async def send_welcome_email(self, user_email: str, user_name: str) -> bool:
        """Send welcome email to new users."""
        subject = "Welcome to CampusScheduler!"
        body = f"""
        <html>
        <body>
            <h1>Welcome to CampusScheduler, {user_name}!</h1>
            <p>Your account has been successfully created.</p>
            <p>You can now:</p>
            <ul>
                <li>View your course timetable</li>
                <li>Submit assignments</li>
                <li>Track your grades</li>
                <li>Receive announcements</li>
            </ul>
            <p>Get started by logging in to your dashboard.</p>
            <br>
            <p>Best regards,<br>The CampusScheduler Team</p>
        </body>
        </html>
        """
        return await self.send_email(to=user_email, subject=subject, body=body, html=True)
    
    async def send_assignment_notification(
        self,
        student_email: str,
        student_name: str,
        assignment_title: str,
        course_name: str,
        due_date: str,
    ) -> bool:
        """Send notification about new assignment."""
        subject = f"New Assignment: {assignment_title}"
        body = f"""
        <html>
        <body>
            <h2>New Assignment Posted</h2>
            <p>Hi {student_name},</p>
            <p>A new assignment has been posted in <strong>{course_name}</strong>:</p>
            <h3>{assignment_title}</h3>
            <p><strong>Due Date:</strong> {due_date}</p>
            <p>Please log in to view the assignment details and submit your work.</p>
            <br>
            <p>Best regards,<br>The CampusScheduler Team</p>
        </body>
        </html>
        """
        return await self.send_email(to=student_email, subject=subject, body=body, html=True)
    
    async def send_grade_notification(
        self,
        student_email: str,
        student_name: str,
        assignment_title: str,
        grade: float,
        max_grade: float,
        feedback: Optional[str] = None,
    ) -> bool:
        """Send notification when assignment is graded."""
        percentage = (grade / max_grade * 100) if max_grade > 0 else 0
        subject = f"Grade Posted: {assignment_title}"
        body = f"""
        <html>
        <body>
            <h2>Assignment Graded</h2>
            <p>Hi {student_name},</p>
            <p>Your assignment <strong>{assignment_title}</strong> has been graded.</p>
            <h3>Score: {grade}/{max_grade} ({percentage:.1f}%)</h3>
            {f'<p><strong>Feedback:</strong><br>{feedback}</p>' if feedback else ''}
            <p>Log in to view detailed feedback and your updated GPA.</p>
            <br>
            <p>Best regards,<br>The CampusScheduler Team</p>
        </body>
        </html>
        """
        return await self.send_email(to=student_email, subject=subject, body=body, html=True)
    
    async def send_announcement_notification(
        self,
        recipient_emails: List[str],
        course_name: str,
        announcement_title: str,
        announcement_body: str,
    ) -> bool:
        """Send announcement to students."""
        subject = f"Announcement: {announcement_title}"
        html_body = f"""
        <html>
        <body>
            <h2>New Announcement in {course_name}</h2>
            <h3>{announcement_title}</h3>
            <div>{announcement_body}</div>
            <br>
            <p>Please log in to respond or view more details.</p>
            <br>
            <p>Best regards,<br>The CampusScheduler Team</p>
        </body>
        </html>
        """
        return await self.send_email(to=recipient_emails, subject=subject, body=html_body, html=True)
    
    async def send_password_reset_email(
        self,
        user_email: str,
        user_name: str,
        reset_token: str,
    ) -> bool:
        """Send password reset email."""
        subject = "Password Reset Request - CampusScheduler"
        reset_link = f"http://localhost:3000/reset-password?token={reset_token}"
        body = f"""
        <html>
        <body>
            <h2>Password Reset Request</h2>
            <p>Hi {user_name},</p>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <p><a href="{reset_link}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">Reset Password</a></p>
            <p>Or copy this link: {reset_link}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request this, please ignore this email.</p>
            <br>
            <p>Best regards,<br>The CampusScheduler Team</p>
        </body>
        </html>
        """
        return await self.send_email(to=user_email, subject=subject, body=body, html=True)


# Singleton instance
email_service = EmailService()


__all__ = ["email_service", "EmailService"]
