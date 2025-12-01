# Infrastructure Setup Summary

Quick reference for the DevOps infrastructure automation setup.

## ✅ What's Been Configured

### 1. Docker Configuration
- ✅ `docker-compose.yml` - Multi-service orchestration
- ✅ `backend/Dockerfile` - Multi-stage Python 3.11 build
- ✅ `frontend/Dockerfile` - Multi-stage Node 20 build
- ✅ `backend/.dockerignore` - Build optimization
- ✅ `frontend/.dockerignore` - Build optimization

### 2. Pre-commit Hooks
- ✅ `.pre-commit-config.yaml` - Automated code quality checks
- ✅ `backend/pyproject.toml` - Ruff configuration (Django-specific)
- ✅ `frontend/.prettierrc.json` - Prettier formatting rules
- ✅ `frontend/.prettierignore` - Prettier exclusions

### 3. Development Tools
- ✅ `Makefile` - Convenient command shortcuts
- ✅ `DEPLOYMENT.md` - Comprehensive deployment guide
- ✅ Updated `README.md` - Docker setup instructions

## 🚀 Quick Start Commands

### Start Everything
```bash
# Option 1: Using Make
make up

# Option 2: Using Docker Compose
docker-compose up --build
```

### Access Services
- **Frontend**: http://localhost:3000
- **Backend GraphQL**: http://localhost:8000/graphql
- **GraphiQL Interface**: http://localhost:8000/graphql

### Common Operations
```bash
# View logs
make logs

# Run tests
make test

# Access backend shell
make shell-backend

# Run migrations
make migrate

# Stop services
make down
```

## 🔧 Pre-commit Hooks

### Installation
```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Run manually
pre-commit run --all-files
```

### What Gets Checked

**Backend (Python):**
- ✅ Ruff linter (replaces flake8, isort, pyupgrade)
- ✅ Ruff formatter (replaces black)
- ✅ Django-specific rules
- ✅ Fast execution (<2 seconds)

**Frontend (TypeScript/React):**
- ✅ ESLint (TypeScript/React rules)
- ✅ Prettier (code formatting)
- ✅ TypeScript type checking
- ✅ Next.js specific rules

**General:**
- ✅ Trailing whitespace removal
- ✅ End-of-file fixer
- ✅ YAML/JSON validation
- ✅ Large file detection
- ✅ Merge conflict detection
- ✅ Private key detection

### Bypass Hooks (Emergency)
```bash
git commit --no-verify
```

## 📊 Docker Services

### Backend Service
- **Image**: Python 3.11-slim
- **Port**: 8000
- **Volume**: `./backend` → `/app` (hot reload)
- **Database**: SQLite in `backend-db` volume
- **Health Check**: Curl GraphQL endpoint every 30s
- **Auto-restart**: Yes

### Frontend Service
- **Image**: Node 20-alpine
- **Port**: 3000
- **Volume**: `./frontend` → `/app` (hot reload)
- **Depends On**: Backend (waits for health check)
- **Health Check**: Wget homepage every 30s
- **Auto-restart**: Yes

### Network
- **Name**: `kanban-network`
- **Type**: Bridge
- **Internal DNS**: Services can reach each other by name

### Volumes
- **`backend-db`**: SQLite database persistence
- **Anonymous volumes**: node_modules and .next (prevents host conflicts)

## 🛠️ Makefile Commands

### Docker Operations
```bash
make build          # Build Docker images
make up             # Start services in background
make down           # Stop services
make restart        # Restart all services
make logs           # View all logs
make logs-backend   # Backend logs only
make logs-frontend  # Frontend logs only
make clean          # Remove containers, volumes, images
```

### Development
```bash
make shell-backend  # Open backend shell
make shell-frontend # Open frontend shell
make migrate        # Run Django migrations
make test           # Run all tests
make test-backend   # Backend tests only
make test-frontend  # Frontend tests only
```

### Code Quality
```bash
make hooks-install  # Install pre-commit hooks
make hooks-run      # Run hooks on all files
make lint           # Run linters only
make format         # Format code
```

## 🔍 Verification Checklist

### Docker Setup
- [ ] `docker-compose config` passes validation
- [ ] `docker-compose up --build` builds images successfully
- [ ] Backend service starts on port 8000
- [ ] Frontend service starts on port 3000
- [ ] Health checks pass (green status)
- [ ] Hot reload works for backend changes
- [ ] Hot reload works for frontend changes
- [ ] Services can communicate (frontend → backend)

### Pre-commit Hooks
- [ ] `pre-commit install` succeeds
- [ ] `pre-commit run --all-files` passes
- [ ] Hooks run on `git commit`
- [ ] Python files are formatted with Ruff
- [ ] TypeScript files are formatted with Prettier
- [ ] ESLint checks TypeScript/React code
- [ ] TypeScript type checking runs

### Testing
- [ ] Backend tests run: `make test-backend`
- [ ] Frontend tests run: `make test-frontend`
- [ ] Tests pass in containers
- [ ] Coverage reports generated

## 🐛 Common Issues

### Port Already in Use
```bash
# Find process using port
lsof -i :8000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Hot Reload Not Working
```bash
# Restart services
make restart

# Or rebuild
make down
make up --build
```

### Database Locked
```bash
# Restart backend
docker-compose restart backend

# If persists, reset volume (LOSES DATA)
make down -v
make up
```

### Out of Memory
```bash
# Check resources
docker stats

# Increase Docker memory (Docker Desktop)
# Settings → Resources → Memory (4GB+)
```

## 📚 Documentation

- **[README.md](./README.md)** - Project overview and quick start
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Comprehensive deployment guide
- **[CLAUDE.md](./CLAUDE.md)** - Claude Code instructions
- **[.pre-commit-config.yaml](./.pre-commit-config.yaml)** - Hook configuration

## 🔐 Security Notes

### Development
- Default Django `SECRET_KEY` (OK for development)
- `DEBUG=True` (OK for development)
- SQLite database (OK for development)
- No SSL/TLS required

### Production (See DEPLOYMENT.md)
- ⚠️ Change `SECRET_KEY` to environment variable
- ⚠️ Set `DEBUG=False`
- ⚠️ Configure `ALLOWED_HOSTS`
- ⚠️ Use PostgreSQL instead of SQLite
- ⚠️ Enable HTTPS with SSL certificates
- ⚠️ Set CORS origins properly
- ⚠️ Configure security headers
- ⚠️ Set resource limits

## 🎯 Next Steps

### For Development
1. Start services: `make up`
2. Install hooks: `make hooks-install`
3. Run tests: `make test`
4. Start coding with hot reload!

### For Production
1. Review [DEPLOYMENT.md](./DEPLOYMENT.md)
2. Create production environment variables
3. Set up production database (PostgreSQL)
4. Configure SSL/TLS certificates
5. Set up monitoring and logging
6. Deploy with production Docker Compose config

## 📞 Support

- **Documentation Issues**: Open GitHub issue
- **Docker Questions**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Pre-commit Issues**: Check `.pre-commit-config.yaml`

---

**Created**: December 2024
**Stack**: Next.js 15, Django 4.2, Docker, Pre-commit
**Purpose**: DevOps automation for Kanban board application
