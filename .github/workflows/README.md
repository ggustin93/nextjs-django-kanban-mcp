# GitHub Actions Workflows

## CI Workflow (`ci.yml`)

**Purpose**: Automated quality checks and build validation for every code change.

### Workflow Structure

The CI workflow runs **5 parallel jobs** on all pushes and pull requests:

| Job | Purpose | Tools | Path Filter |
|-----|---------|-------|-------------|
| **lint-backend** | Python code quality | Ruff (lint + format) | `backend/**` |
| **lint-frontend** | TypeScript code quality | ESLint, TypeScript | `frontend/**` |
| **test-backend** | Django test suite (20 tests) | pytest, Django | `backend/**` |
| **test-frontend** | React test suite (12 tests) | Jest, React Testing Library | `frontend/**` |
| **build-docker** | Docker build validation | Docker Buildx | All files |

### Key Features

**✅ Optimizations**:
- **Parallel Execution**: All jobs run simultaneously for speed
- **Smart Caching**: pip, npm, and Docker layer caching for faster builds
- **Path Filters**: Only run relevant jobs when files change (saves GitHub Actions minutes)
- **Concurrency Control**: Cancel in-progress runs when new commits are pushed

**⚡ Performance**:
- **Initial Run**: ~8 minutes (no cache)
- **Cached Runs**: ~3 minutes (cache hit)
- **Estimated Usage**: ~150 minutes/month (well within free tier 2000 min/month)

### Triggers

```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
```

**When does the workflow run?**
- Every push to `main` or `develop` branches
- Every pull request targeting `main` or `develop`
- Path filters determine which jobs execute

### Required Checks

For pull request approval, all jobs must pass:
- ✅ Backend linting (Ruff)
- ✅ Frontend linting (ESLint + TypeScript)
- ✅ Backend tests (Django test suite)
- ✅ Frontend tests (Jest test suite)
- ✅ Docker builds (multi-stage validation)

## Branch Protection Setup

**Recommended GitHub branch protection settings for `main`**:

1. Navigate to **Settings → Branches → Branch protection rules**
2. Add rule for `main` branch:
   - ☑️ Require status checks to pass before merging
   - ☑️ Require branches to be up to date before merging
   - ☑️ Select status checks:
     - `lint-backend`
     - `lint-frontend`
     - `test-backend`
     - `test-frontend`
     - `build-docker`
   - ☑️ Require linear history
   - ☑️ Do not allow bypassing the above settings

3. Optionally enable:
   - ☑️ Require pull request reviews before merging (1 approval)
   - ☑️ Require conversation resolution before merging

## Troubleshooting

### Job Skipped Due to Path Filter

**Symptom**: Job shows "skipped" status on GitHub Actions

**Cause**: Path filter condition not met (e.g., only frontend files changed, so backend jobs skipped)

**Solution**: This is expected behavior and saves GitHub Actions minutes. If you need to force all jobs to run, push a change that touches both `backend/` and `frontend/` directories.

### Cache Miss on First Run

**Symptom**: Workflow takes ~8 minutes on first run

**Cause**: No cached dependencies or Docker layers

**Solution**: Subsequent runs will be faster (~3 minutes) as caches are populated. Cache is shared across branches.

### Docker Build Fails

**Symptom**: `build-docker` job fails with build error

**Common Causes**:
1. Invalid Dockerfile syntax
2. Missing dependencies in requirements.txt or package.json
3. Docker Buildx configuration issue

**Solution**: Test Docker builds locally first:
```bash
docker-compose build
```

## Local Testing

Before pushing, verify your changes pass all checks:

```bash
# Backend checks
cd backend
ruff check .
ruff format --check .
python manage.py test

# Frontend checks
cd frontend
npm run lint
npx tsc --noEmit
npm test

# Docker validation
docker-compose build
```

## Cost Estimation

**GitHub Actions Free Tier**: 2000 minutes/month

**Estimated Usage**:
- ~50 workflow runs/month (2 per day)
- ~3 minutes per run (with caching)
- **Total**: ~150 minutes/month (7.5% of free tier)

**Optimization Tips**:
- Path filters prevent unnecessary job execution
- Caching reduces run time by ~60%
- Concurrency control prevents duplicate runs
