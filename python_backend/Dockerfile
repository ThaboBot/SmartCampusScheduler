# Multi-stage Dockerfile for CampusScheduler Python Backend
# Optimized for production with minimal image size

# ==============================================================================
# Stage 1: Builder - Install dependencies and compile bytecode
# ==============================================================================
FROM python:3.11-slim as builder

WORKDIR /app

# Install system dependencies needed for Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy source code and pre-compile Python bytecode
COPY . .
RUN python -m compileall -q app/

# ==============================================================================
# Stage 2: Production - Minimal runtime image
# ==============================================================================
FROM python:3.11-slim as production

WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH" \
    APP_ENV=production

# Install only runtime dependencies (no build tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv

# Copy compiled application code
COPY --from=builder /app/app ./app
COPY --from=builder /app/alembic ./alembic
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/alembic.ini ./alembic.ini
COPY --from=builder /app/main.py ./main.py

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash appuser && \
    chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# ==============================================================================
# Stage 3: Development - With debugging tools
# ==============================================================================
FROM production as development

USER root

# Install development dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    vim \
    && rm -rf /var/lib/apt/lists/*

# Install dev-only Python packages
COPY requirements-dev.txt . || true
RUN pip install --no-cache-dir -r requirements-dev.txt 2>/dev/null || true

# Copy full source code (not compiled)
COPY . .

# Switch back to non-root user
USER appuser

# Enable reload for development
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
