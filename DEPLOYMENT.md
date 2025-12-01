# Deployment Guide

Complete guide for deploying the Next.js + Django Kanban application using Docker.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Docker Setup](#docker-setup)
- [Development Deployment](#development-deployment)
- [Production Deployment](#production-deployment)
- [Environment Configuration](#environment-configuration)
- [Monitoring and Logging](#monitoring-and-logging)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- **Docker**: Version 20.10+ ([Install Docker](https://docs.docker.com/get-docker/))
- **Docker Compose**: Version 2.0+ (bundled with Docker Desktop)
- **Git**: For cloning the repository
- **Optional**: Make utility for command shortcuts

### System Requirements
- **CPU**: 2+ cores recommended
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 10GB free space for images and volumes
- **OS**: Linux, macOS, or Windows with WSL2

### Verify Installation
```bash
# Check Docker version
docker --version
# Expected: Docker version 20.10.0 or higher

# Check Docker Compose version
docker-compose --version
# Expected: Docker Compose version 2.0.0 or higher

# Verify Docker is running
docker ps
# Should return empty list or running containers (no errors)
```

## Docker Setup

### Architecture Overview

The application runs in two containers:

1. **Backend Container** (`kanban-backend`)
   - Django 4.2 with Python 3.11
   - GraphQL API (Graphene-Django)
   - SQLite database with volume persistence
   - Runs on port 8000
   - Hot reload enabled in development

2. **Frontend Container** (`kanban-frontend`)
   - Next.js 15 with Node.js 20
   - Apollo Client for GraphQL
   - Material-UI components
   - Runs on port 3000
   - Hot reload enabled in development

### Network Configuration
- **Network**: `kanban-network` (bridge driver)
- **Backend URL**: `http://backend:8000` (internal)
- **Frontend URL**: `http://localhost:3000` (external)
- **GraphQL API**: `http://localhost:8000/graphql` (external)

### Volume Configuration
- **Backend DB**: `backend-db` volume for SQLite persistence
- **Code Volumes**: Mounted for hot reload in development

## Development Deployment

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd nextjs-django-kanban-mcp

# Start services with hot reload
make up
# OR
docker-compose up --build
```

### Step-by-Step Process

1. **Build Images**
   ```bash
   # Build both frontend and backend images
   docker-compose build

   # Build specific service
   docker-compose build backend
   docker-compose build frontend
   ```

2. **Start Services**
   ```bash
   # Start in detached mode (background)
   docker-compose up -d

   # Start with logs visible
   docker-compose up

   # Rebuild and start
   docker-compose up --build
   ```

3. **Verify Services**
   ```bash
   # Check running containers
   docker-compose ps

   # Expected output:
   # kanban-backend    running   0.0.0.0:8000->8000/tcp
   # kanban-frontend   running   0.0.0.0:3000->3000/tcp

   # Check health status
   docker-compose ps --format json | jq '.[] | {name: .Name, health: .Health}'
   ```

4. **Access Application**
   - Frontend: http://localhost:3000
   - GraphQL API: http://localhost:8000/graphql
   - GraphiQL Interface: http://localhost:8000/graphql (interactive)

### Development Workflow

**Code Changes and Hot Reload:**
```bash
# Backend changes auto-reload via Django runserver
# Frontend changes auto-reload via Next.js dev server
# No restart needed for code changes!

# View logs to confirm reload
make logs
```

**Database Operations:**
```bash
# Run migrations
make migrate
# OR
docker-compose exec backend python manage.py migrate

# Seed development data
docker-compose exec backend python manage.py seed_tasks

# Clear and reseed
docker-compose exec backend python manage.py seed_tasks --clear

# Access Django shell
make shell-backend
# OR
docker-compose exec backend python manage.py shell
```

**Testing:**
```bash
# Run all tests
make test

# Run backend tests only
make test-backend
# OR
docker-compose exec backend python manage.py test kanban.tests

# Run frontend tests only
make test-frontend
# OR
docker-compose exec frontend npm test

# Run frontend tests with coverage
docker-compose exec frontend npm run test:coverage
```

**Code Quality:**
```bash
# Run pre-commit hooks
make hooks-run

# Run linters
make lint

# Format code
make format
```

### Stopping and Cleaning Up

```bash
# Stop services (preserves data)
make down
# OR
docker-compose down

# Stop and remove volumes (DELETES DATA)
docker-compose down -v

# Complete cleanup (removes images too)
make clean
# OR
docker-compose down -v --rmi all
```

## Production Deployment

### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.9'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    container_name: kanban-backend-prod
    ports:
      - "8000:8000"
    volumes:
      - backend-db-prod:/app/data
    environment:
      - DJANGO_SETTINGS_MODULE=config.settings_prod
      - SECRET_KEY=${SECRET_KEY}
      - DEBUG=False
      - ALLOWED_HOSTS=${ALLOWED_HOSTS}
    command: gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/graphql"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - kanban-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: production
    container_name: kanban-frontend-prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_GRAPHQL_URL=https://api.yourdomain.com/graphql
    depends_on:
      - backend
    restart: always
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - kanban-network

  nginx:
    image: nginx:alpine
    container_name: kanban-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
      - frontend
    restart: always
    networks:
      - kanban-network

volumes:
  backend-db-prod:
    driver: local

networks:
  kanban-network:
    driver: bridge
```

### Production Checklist

**Before Deployment:**
- [ ] Set `DEBUG=False` in Django settings
- [ ] Configure `SECRET_KEY` from environment variable
- [ ] Set `ALLOWED_HOSTS` with production domain
- [ ] Configure CORS with production frontend URL
- [ ] Set up SSL certificates for HTTPS
- [ ] Configure database backups
- [ ] Set up logging and monitoring
- [ ] Review security headers
- [ ] Configure rate limiting
- [ ] Set resource limits for containers

**Environment Variables:**
```bash
# Create .env.prod file
cat > .env.prod << EOF
SECRET_KEY=your-secure-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgresql://user:pass@db:5432/kanban
NEXT_PUBLIC_GRAPHQL_URL=https://api.yourdomain.com/graphql
EOF
```

**Deploy:**
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Collect static files
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --no-input

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Environment Configuration

### Backend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PYTHONUNBUFFERED` | `1` | Disable Python output buffering |
| `DJANGO_SETTINGS_MODULE` | `config.settings` | Django settings module |
| `SECRET_KEY` | (dev key) | Django secret key (change in production!) |
| `DEBUG` | `True` | Debug mode (set `False` in production) |
| `ALLOWED_HOSTS` | `[]` | Allowed hostnames |
| `DATABASE_URL` | SQLite | Database connection string |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | CORS allowed origins |

### Frontend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Node environment |
| `NEXT_PUBLIC_GRAPHQL_URL` | `http://backend:8000/graphql` | GraphQL API URL |
| `NEXT_TELEMETRY_DISABLED` | `1` | Disable Next.js telemetry |
| `WATCHPACK_POLLING` | `true` | Enable file watching in Docker |

## Monitoring and Logging

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100

# Timestamps
docker-compose logs -f --timestamps
```

### Health Checks

```bash
# Check container health
docker-compose ps

# Check backend health
curl http://localhost:8000/graphql

# Check frontend health
curl http://localhost:3000

# Inspect health check details
docker inspect kanban-backend | jq '.[0].State.Health'
```

### Resource Monitoring

```bash
# Container stats (CPU, Memory, Network)
docker stats

# Disk usage
docker system df

# Image sizes
docker images | grep kanban
```

## Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Error: bind: address already in use
# Solution: Stop conflicting service or change port in docker-compose.yml

# Find process using port 8000
lsof -i :8000
# OR
netstat -ano | grep 8000

# Kill process
kill -9 <PID>
```

**2. Frontend Can't Connect to Backend**
```bash
# Check backend is healthy
docker-compose ps backend

# Check network connectivity
docker-compose exec frontend curl http://backend:8000/graphql

# Verify environment variable
docker-compose exec frontend env | grep GRAPHQL_URL

# Restart frontend
docker-compose restart frontend
```

**3. Database Locked Error**
```bash
# SQLite database is locked
# Solution: Restart backend container

docker-compose restart backend

# If problem persists, delete database volume (LOSES DATA)
docker-compose down -v
docker-compose up -d
```

**4. Hot Reload Not Working**
```bash
# Backend hot reload issue
# Check volume mount
docker-compose exec backend ls -la /app

# Restart with rebuild
docker-compose up --build

# Frontend hot reload issue
# Ensure WATCHPACK_POLLING is set
docker-compose exec frontend env | grep WATCHPACK_POLLING
```

**5. Out of Memory**
```bash
# Check container resources
docker stats

# Increase Docker resources (Docker Desktop)
# Settings > Resources > Advanced
# Increase Memory to 4GB+

# Add resource limits to docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
```

### Debug Commands

```bash
# Enter container shell
docker-compose exec backend sh
docker-compose exec frontend sh

# Check file mounts
docker-compose exec backend ls -la /app
docker-compose exec frontend ls -la /app

# View environment variables
docker-compose exec backend env
docker-compose exec frontend env

# Restart specific service
docker-compose restart backend

# Rebuild specific service
docker-compose up -d --build backend

# View container details
docker inspect kanban-backend
docker inspect kanban-frontend
```

### Getting Help

**Logs to Include:**
```bash
# Full logs
docker-compose logs > debug.log

# Container details
docker-compose ps --format json > containers.json

# System info
docker info > docker-info.txt
docker version > docker-version.txt
```

**Support Channels:**
- GitHub Issues: [Repository URL]
- Documentation: [Docs URL]
- Email: [Support Email]

## Performance Optimization

### Production Optimizations

**Backend (Django):**
- Use Gunicorn with multiple workers
- Enable database connection pooling
- Configure static file serving via CDN
- Enable query optimization and caching
- Use production-grade database (PostgreSQL)

**Frontend (Next.js):**
- Enable static optimization
- Configure image optimization
- Implement code splitting
- Use CDN for static assets
- Enable compression

**Docker:**
- Use multi-stage builds (already configured)
- Minimize image layers
- Use `.dockerignore` properly (already configured)
- Set resource limits
- Use health checks (already configured)

### Monitoring Recommendations

**Application Monitoring:**
- **Backend**: Django Debug Toolbar (dev), Sentry (prod)
- **Frontend**: Vercel Analytics or similar
- **Performance**: Lighthouse CI, Web Vitals

**Infrastructure Monitoring:**
- **Containers**: Docker stats, cAdvisor
- **Logs**: ELK Stack or Grafana Loki
- **Alerts**: Prometheus + Alertmanager

## Security Considerations

### Production Security

**Django Security:**
- Set `DEBUG=False`
- Use strong `SECRET_KEY` from environment
- Configure `ALLOWED_HOSTS` properly
- Enable HTTPS only (`SECURE_SSL_REDIRECT=True`)
- Set security headers (`X-Frame-Options`, `X-Content-Type-Options`)
- Configure CORS properly
- Use Django's security middleware

**Container Security:**
- Run as non-root user (already configured)
- Minimize attack surface (minimal base images)
- Keep images updated
- Scan for vulnerabilities
- Use read-only file systems where possible

**Network Security:**
- Use internal networks for inter-service communication
- Expose only necessary ports
- Implement rate limiting
- Use SSL/TLS for all external communication
- Configure firewall rules

### Backup Strategy

**Database Backup:**
```bash
# Backup SQLite database
docker-compose exec backend python manage.py dumpdata > backup.json

# Restore from backup
docker-compose exec backend python manage.py loaddata backup.json

# For production (PostgreSQL)
docker-compose exec backend pg_dump -U user kanban > backup.sql
```

**Volume Backup:**
```bash
# Backup Docker volume
docker run --rm -v backend-db:/data -v $(pwd):/backup alpine \
  tar czf /backup/backup.tar.gz /data

# Restore Docker volume
docker run --rm -v backend-db:/data -v $(pwd):/backup alpine \
  tar xzf /backup/backup.tar.gz -C /
```

## Additional Resources

- **Docker Documentation**: https://docs.docker.com/
- **Docker Compose Documentation**: https://docs.docker.com/compose/
- **Django Deployment Checklist**: https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/
- **Next.js Deployment**: https://nextjs.org/docs/deployment

---

**Last Updated**: December 2024
**Maintained by**: [Your Name]
