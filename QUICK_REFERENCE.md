# Quick Reference Guide

## 🚀 Before Pushing to GitHub

**Run all CI checks locally:**
```bash
./scripts/check-ci.sh
```

This single command runs all 5 CI jobs that GitHub Actions will run.

---

## 📋 Individual Check Commands

### Backend Checks

```bash
cd backend
source venv/bin/activate

# Linting
ruff check .

# Formatting
ruff format --check .

# Fix formatting automatically
ruff format .

# Tests
python manage.py test

# Tests with coverage
coverage run --source='.' manage.py test
coverage report
```

### Frontend Checks

```bash
cd frontend

# Linting
npm run lint

# TypeScript type checking
npx tsc --noEmit

# Tests
npm test

# Tests with coverage
npm test -- --coverage

# Tests in watch mode
npm test -- --watch
```

### Docker Validation

```bash
# Validate docker-compose configuration
docker-compose config

# Build and start services
docker-compose up --build

# Run backend tests in Docker
docker-compose exec backend python manage.py test

# Run frontend tests in Docker
docker-compose exec frontend npm test
```

---

## 🔧 Common Development Tasks

### Backend Development

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create Django superuser
python manage.py createsuperuser

# Seed sample data
python manage.py seed_tasks

# Clear and reseed data
python manage.py seed_tasks --clear

# Django shell
python manage.py shell

# Export GraphQL schema
python scripts/export_schema.py
```

### Frontend Development

```bash
# Development server (hot-reload)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Code generation (if using GraphQL codegen)
npm run codegen
```

### Docker Operations

```bash
# Start services in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild specific service
docker-compose up --build backend

# Access backend shell
docker-compose exec backend python manage.py shell

# Access frontend shell
docker-compose exec frontend sh
```

---

## 🎯 Pre-commit Hooks

```bash
# Install pre-commit hooks
pip install pre-commit
pre-commit install

# Run manually on all files
pre-commit run --all-files

# Run on staged files only
pre-commit run

# Skip hooks for a commit (not recommended)
git commit --no-verify -m "message"
```

---

## 🧪 Testing Shortcuts

```bash
# Run all tests (requires Docker)
make test

# Backend only
make test-backend

# Frontend only
make test-frontend

# All CI checks locally
./scripts/check-ci.sh
```

---

## 📊 Code Quality Reports

### Backend Coverage Report

```bash
cd backend
coverage run --source='.' manage.py test
coverage report
coverage html  # Generates HTML report in htmlcov/
```

### Frontend Coverage Report

```bash
cd frontend
npm test -- --coverage
# Report available in coverage/lcov-report/index.html
```

---

## 🐛 Debugging

### Backend Debugging

```bash
# Check Django configuration
python manage.py check

# Show migrations
python manage.py showmigrations

# Database shell
python manage.py dbshell

# Test specific app
python manage.py test kanban

# Verbose test output
python manage.py test --verbosity=3
```

### Frontend Debugging

```bash
# Check for TypeScript errors
npx tsc --noEmit

# Check specific file
npx tsc --noEmit src/components/Board.tsx

# ESLint specific file
npx eslint src/components/Board.tsx

# Prettier check specific file
npx prettier --check src/components/Board.tsx
```

### Docker Debugging

```bash
# Check container status
docker-compose ps

# View container logs
docker-compose logs backend
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f backend

# Restart specific service
docker-compose restart backend

# Remove all containers and volumes
docker-compose down -v
```

---

## 🔄 Git Workflow

### Before Committing

```bash
# Run all checks
./scripts/check-ci.sh

# Stage changes
git add .

# Commit (triggers pre-commit hooks)
git commit -m "feat: add feature X"
```

### Commit Message Format

```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, test, chore
Scope: backend, frontend, ci, docker, etc.

Examples:
feat(backend): add priority field to Task model
fix(frontend): resolve drag-and-drop state bug
docs(readme): update deployment instructions
ci(workflows): add deployment pipeline
```

---

## 🚢 Deployment

### Local Deployment Check

```bash
# Verify all CI checks pass
./scripts/check-ci.sh

# Build production images
docker-compose -f docker-compose.prod.yml build

# Test production build locally
docker-compose -f docker-compose.prod.yml up
```

### GitHub Actions Workflows

**CI Workflow (Automatic):**
- Triggers on push to `main`/`develop`
- Runs linting, tests, builds
- Must pass before deployment

**Deploy Workflow (Automatic after CI):**
- Builds production images
- Deploys to staging automatically
- Requires manual approval for production

---

## 📝 Port Configuration

Default ports (configurable via `.env`):
- **Frontend**: `3000`
- **Backend**: `8000`

To change ports:
```bash
# Create .env file
cp .env.example .env

# Edit ports
FRONTEND_PORT=3001
BACKEND_PORT=8001

# Restart Docker
docker-compose down && docker-compose up
```

---

## 🆘 Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill <PID>

# Or change port in .env
```

### Docker Issues

```bash
# Clean Docker system
docker system prune -a

# Remove all volumes
docker-compose down -v

# Rebuild from scratch
docker-compose build --no-cache
```

### Backend Issues

```bash
# Delete database and start fresh
rm backend/db.sqlite3
python manage.py migrate
python manage.py seed_tasks
```

### Frontend Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run build
```

---

## 📚 Useful Links

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/graphql
- **GitHub Actions**: https://github.com/[username]/[repo]/actions
- **Django Admin**: http://localhost:8000/admin (after creating superuser)

---

## 💡 Pro Tips

1. **Always run `./scripts/check-ci.sh` before pushing** - saves time by catching issues locally
2. **Use Docker for consistent environment** - avoids "works on my machine" issues
3. **Pre-commit hooks auto-fix many issues** - let them format your code
4. **Check CI status before merging PRs** - green builds only!
5. **Test locally with production build** - catch environment-specific issues early
