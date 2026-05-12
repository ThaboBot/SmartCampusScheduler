"""
Request logging middleware for structured logging.
Logs all incoming requests with timing information.
"""
import time
import json
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config import settings


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging HTTP requests and responses."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process the request and log details."""
        start_time = time.time()
        
        # Extract request information
        client_host = request.client.host if request.client else "unknown"
        method = request.method
        path = request.url.path
        query_params = str(request.query_params) if request.query_params else ""
        
        # Log request
        log_entry = {
            "timestamp": time.time(),
            "type": "request",
            "client_ip": client_host,
            "method": method,
            "path": path,
            "query_params": query_params,
            "user_agent": request.headers.get("user-agent", "unknown"),
        }
        
        if settings.DEBUG:
            print(f"[REQUEST] {method} {path} from {client_host}")
        
        try:
            # Process request
            response = await call_next(request)
            
            # Calculate processing time
            process_time = time.time() - start_time
            
            # Add timing header
            response.headers["X-Process-Time"] = str(process_time)
            
            # Log response
            log_entry.update({
                "type": "response",
                "status_code": response.status_code,
                "process_time_ms": round(process_time * 1000, 2),
            })
            
            if settings.DEBUG:
                print(f"[RESPONSE] {method} {path} - {response.status_code} in {log_entry['process_time_ms']}ms")
            
            return response
            
        except Exception as exc:
            process_time = time.time() - start_time
            log_entry.update({
                "type": "error",
                "error": str(exc),
                "process_time_ms": round(process_time * 1000, 2),
            })
            
            if settings.DEBUG:
                print(f"[ERROR] {method} {path} - {str(exc)} in {log_entry['process_time_ms']}ms")
            
            raise


__all__ = ["LoggingMiddleware"]
