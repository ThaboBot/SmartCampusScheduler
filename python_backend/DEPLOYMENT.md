# CampusScheduler Python Backend - Production Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Production Checklist](#production-checklist)
3. [Deployment Options](#deployment-options)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Security Hardening](#security-hardening)
7. [Monitoring & Logging](#monitoring--logging)
8. [Scaling Strategies](#scaling-strategies)
9. [Backup & Recovery](#backup--recovery)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Services
- **PostgreSQL 15+** (production-grade database)
- **Redis 7+** (caching and session management)
- **Docker & Docker Compose** (containerization)
- **Nginx** (reverse proxy, optional but recommended)
- **SSL Certificate** (Let's Encrypt or commercial)

### Recommended Infrastructure
- **Load Balancer** (for high availability)
- **CDN** (for static assets)
- **Monitoring Stack** (Prometheus + Grafana)
- **Log Aggregation** (ELK Stack or similar)

---

## Production Checklist

### Pre-Deployment
- [ ] All tests passing (`pytest --cov-fail-under=80`)
- [ ] Security audit completed
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Backup strategy implemented
- [ ] Monitoring configured
- [ ] SSL certificates obtained
- [ ] Domain DNS configured
- [ ] Firewall rules set up

### Post-Deployment
- [ ] Health checks passing
- [ ] API response times acceptable (<200ms average)
- [ ] Error rates below threshold (<0.1%)
- [ ] Database connections stable
- [ ] Cache hit rates monitored
- [ ] Logs flowing to aggregation service
- [ ] Alerts configured and tested

---

## Deployment Options

### Option 1: Docker Compose (Single Server)

```bash
# Use production docker-compose file
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f app

# Scale workers
docker-compose up -d --scale app=4
```

### Option 2: Kubernetes

```yaml
# deployment.yaml example
apiVersion: apps/v1
kind: Deployment
metadata:
  name: campusscheduler-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: campusscheduler
  template:
    metadata:
      labels:
        app: campusscheduler
    spec:
      containers:
      - name: api
        image: ghcr.io/your-org/campusscheduler:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Option 3: Cloud Platforms

#### AWS ECS/Fargate
```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker build -t campusscheduler .
docker tag campusscheduler:latest <account>.dkr.ecr.us-east-1.amazonaws.com/campusscheduler:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/campusscheduler:latest
```

#### Google Cloud Run
```bash
gcloud run deploy campusscheduler \
  --image gcr.io/your-project/campusscheduler \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=postgresql://...
```

#### Heroku
```bash
heroku create campusscheduler-api
heroku config:set SECRET_KEY=$(openssl rand -hex 32)
heroku config:set DATABASE_URL=postgresql://...
git push heroku main
heroku ps:scale web=1
```

---

## Environment Configuration

### Production .env Template

```bash
# Application
APP_ENV=production
DEBUG=false
SECRET_KEY=<generate-strong-random-key>
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Database
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/dbname
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=10

# Redis
REDIS_URL=redis://host:6379/0
REDIS_SSL=true

# Security
CORS_ORIGINS=["https://yourdomain.com"]
ALLOWED_HOSTS=["api.yourdomain.com"]
CSRF_SECRET_KEY=<another-random-key>

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<sendgrid-api-key>
EMAIL_FROM=noreply@yourdomain.com

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json

# Monitoring
SENTRY_DSN=https://<key>@sentry.io/<project-id>
ENABLE_METRICS=true

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_BURST=100
```

### Generate Secure Keys

```bash
# Generate SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Generate CSRF_SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## Database Setup

### PostgreSQL Configuration

```sql
-- Create user and database
CREATE USER campusscheduler WITH PASSWORD 'strong_password';
CREATE DATABASE campusscheduler OWNER campusscheduler;
GRANT ALL PRIVILEGES ON DATABASE campusscheduler TO campusscheduler;

-- Configure connection pooling (in postgresql.conf)
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
```

### Run Migrations in Production

```bash
# Apply all migrations
alembic upgrade head

# Verify migration status
alembic current
```

### Database Optimization

```sql
-- Create indexes for common queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_courses_code ON courses(code);
CREATE INDEX idx_assignments_due_date ON assignments(due_date);
CREATE INDEX idx_grades_student_id ON grades(student_id);

-- Analyze tables for query optimization
ANALYZE users;
ANALYZE courses;
ANALYZE assignments;
```

---

## Security Hardening

### Nginx Reverse Proxy Configuration

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
    }

    # Rate limiting zone
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000" always;
}
```

### Firewall Rules (UFW)

```bash
# Enable firewall
ufw enable

# Allow SSH
ufw allow 22/tcp

# Allow HTTP/HTTPS (if not using Nginx)
ufw allow 80/tcp
ufw allow 443/tcp

# Deny direct access to app port
ufw deny 8000/tcp

# Allow only from localhost (if using Nginx)
ufw allow from 127.0.0.1 to any port 8000
```

---

## Monitoring & Logging

### Prometheus Metrics Endpoint

Add to `main.py`:

```python
from prometheus_fastapi_instrumentator import Instrumentator

instrumentator = Instrumentator()
instrumentator.instrument(app).expose(app, endpoint="/metrics")
```

### Grafana Dashboard Example

Import dashboard ID: `10915` (FastAPI Prometheus)

### Structured Logging Configuration

```python
# In config.py
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json": {
            "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
            "format": "%(asctime)s %(name)s %(levelname)s %(message)s"
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "json",
            "stream": "ext://sys.stdout"
        }
    },
    "root": {
        "level": "INFO",
        "handlers": ["console"]
    }
}
```

### Sentry Integration

```python
# In main.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    integrations=[FastApiIntegration()],
    traces_sample_rate=0.1,
    environment=os.getenv("APP_ENV", "production")
)
```

---

## Scaling Strategies

### Horizontal Scaling

```bash
# Docker Compose
docker-compose up -d --scale app=4

# Kubernetes
kubectl scale deployment campusscheduler-api --replicas=5
```

### Database Connection Pooling

```python
# In db/session.py
engine = create_async_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=40,
    pool_pre_ping=True,
    pool_recycle=3600
)
```

### Caching Strategy

```python
# Cache expensive queries
@cache.cached(ttl=300, key_builder=lambda f, *args: f"courses:{args[0]}")
async def get_course(course_id: int):
    # ... query logic
```

### Load Balancing

```nginx
upstream campusscheduler {
    least_conn;
    server 127.0.0.1:8001 weight=3;
    server 127.0.0.1:8002 weight=3;
    server 127.0.0.1:8003 weight=3;
    server 127.0.0.1:8004 backup;
}
```

---

## Backup & Recovery

### Automated Database Backups

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="campusscheduler"
DB_USER="campusscheduler"

# Create backup
pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/backup_$DATE.sql.gz s3://your-bucket/backups/
```

### Cron Job for Daily Backups

```bash
# Add to crontab
0 2 * * * /path/to/backup.sh
```

### Disaster Recovery Plan

1. **Restore Database**:
   ```bash
   gunzip -c backup_20250101_020000.sql.gz | psql -U campusscheduler -h localhost campusscheduler
   ```

2. **Restore from Backup**:
   ```bash
   docker-compose down
   docker volume rm campusscheduler_postgres_data
   docker-compose up -d db
   # Run restore command above
   docker-compose up -d app
   ```

3. **Verify Data Integrity**:
   ```bash
   curl http://localhost:8000/health
   alembic current
   ```

---

## Troubleshooting

### Common Issues

#### High Memory Usage
```bash
# Check container memory
docker stats

# Reduce worker count
docker-compose up -d --scale app=2
```

#### Database Connection Errors
```bash
# Check connection pool
docker-compose exec app python -c "from app.db.session import engine; print(engine.pool.status())"

# Increase pool size in .env
DB_POOL_SIZE=30
```

#### Slow API Responses
```bash
# Enable query logging
DATABASE_URL="postgresql+asyncpg://...?log_queries=true"

# Check slow queries in PostgreSQL
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;
```

#### High Error Rate
```bash
# Check application logs
docker-compose logs app | grep ERROR

# Review Sentry dashboard
# https://sentry.io/organizations/your-org/issues/
```

### Emergency Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/campusscheduler-api

# Or with Docker Compose
git checkout <previous-commit>
docker-compose build
docker-compose up -d
```

---

## Support

For production support:
- **Documentation**: https://github.com/your-org/campusscheduler/docs
- **Issues**: https://github.com/your-org/campusscheduler/issues
- **Email**: support@campusscheduler.com

---

*Last Updated: January 2025*
*Version: 1.0.0*
