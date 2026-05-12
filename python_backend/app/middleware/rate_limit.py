"""
Rate limiting middleware to prevent API abuse.
Uses Redis for distributed rate limiting across multiple instances.
"""
import time
from typing import Callable, Optional
from fastapi import Request, Response, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config import settings


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware for rate limiting API requests."""
    
    def __init__(self, app, redis_client=None):
        super().__init__(app)
        self.redis = redis_client
        # In-memory fallback if Redis is not available
        self.memory_store: dict[str, list[float]] = {}
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Check rate limit before processing request."""
        # Skip rate limiting for health checks and docs
        if request.url.path in ["/health", "/docs", "/redoc", "/openapi.json", "/"]:
            return await call_next(request)
        
        # Get client identifier (IP address or user ID if authenticated)
        client_id = await self._get_client_identifier(request)
        current_time = time.time()
        window_start = current_time - 60  # 1-minute window
        
        # Clean old entries
        await self._cleanup_old_entries(client_id, window_start)
        
        # Get current request count
        request_count = await self._get_request_count(client_id, window_start)
        
        # Check if limit exceeded
        if request_count >= settings.RATE_LIMIT_PER_MINUTE:
            raise HTTPException(
                status_code=429,
                detail={
                    "success": False,
                    "error": {
                        "code": "RATE_LIMIT_EXCEEDED",
                        "message": f"Too many requests. Limit: {settings.RATE_LIMIT_PER_MINUTE} per minute",
                        "retry_after": 60
                    }
                }
            )
        
        # Record this request
        await self._record_request(client_id, current_time)
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers
        remaining = settings.RATE_LIMIT_PER_MINUTE - request_count - 1
        response.headers["X-RateLimit-Limit"] = str(settings.RATE_LIMIT_PER_MINUTE)
        response.headers["X-RateLimit-Remaining"] = str(max(0, remaining))
        response.headers["X-RateLimit-Reset"] = str(int(current_time + 60))
        
        return response
    
    async def _get_client_identifier(self, request: Request) -> str:
        """Get unique identifier for the client."""
        # Try to get user ID from authentication
        user_id = getattr(request.state, "user_id", None)
        if user_id:
            return f"user:{user_id}"
        
        # Fallback to IP address
        client_ip = request.client.host if request.client else "unknown"
        return f"ip:{client_ip}"
    
    async def _cleanup_old_entries(self, client_id: str, window_start: float):
        """Remove entries older than the rate limit window."""
        if self.redis:
            try:
                await self.redis.zremrangebyscore(f"ratelimit:{client_id}", 0, window_start)
                return
            except Exception:
                pass
        
        # Memory store cleanup
        if client_id in self.memory_store:
            self.memory_store[client_id] = [
                ts for ts in self.memory_store[client_id] if ts > window_start
            ]
    
    async def _get_request_count(self, client_id: str, window_start: float) -> int:
        """Get the number of requests in the current window."""
        if self.redis:
            try:
                return await self.redis.zcard(f"ratelimit:{client_id}")
            except Exception:
                pass
        
        # Memory store fallback
        if client_id not in self.memory_store:
            self.memory_store[client_id] = []
        
        return len([ts for ts in self.memory_store[client_id] if ts > window_start])
    
    async def _record_request(self, client_id: str, timestamp: float):
        """Record a new request."""
        if self.redis:
            try:
                await self.redis.zadd(f"ratelimit:{client_id}", {str(timestamp): timestamp})
                await self.redis.expire(f"ratelimit:{client_id}", 120)  # TTL of 2 minutes
                return
            except Exception:
                pass
        
        # Memory store fallback
        if client_id not in self.memory_store:
            self.memory_store[client_id] = []
        self.memory_store[client_id].append(timestamp)


__all__ = ["RateLimitMiddleware"]
