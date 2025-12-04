#!/bin/bash

# ============================================================================
# Local CI Check Script
# Run this before pushing to ensure all CI checks will pass
# ============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track failures
FAILURES=0

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  🔍 Running Local CI Checks${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ============================================================================
# BACKEND CHECKS
# ============================================================================
echo -e "${YELLOW}📦 Backend Checks${NC}"
echo ""

# Check if backend dependencies are installed
if [ ! -d "backend/venv" ]; then
    echo -e "${YELLOW}⚠️  Virtual environment not found. Creating...${NC}"
    cd backend
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

cd backend
source venv/bin/activate

# Ruff linting
echo -e "${BLUE}→${NC} Running Ruff linter..."
if ruff check .; then
    echo -e "${GREEN}✓${NC} Ruff linting passed"
else
    echo -e "${RED}✗${NC} Ruff linting failed"
    FAILURES=$((FAILURES + 1))
fi
echo ""

# Ruff formatting check
echo -e "${BLUE}→${NC} Checking Ruff formatting..."
if ruff format --check .; then
    echo -e "${GREEN}✓${NC} Ruff formatting check passed"
else
    echo -e "${RED}✗${NC} Ruff formatting check failed"
    echo -e "${YELLOW}  Run 'ruff format .' to fix${NC}"
    FAILURES=$((FAILURES + 1))
fi
echo ""

# Django tests
echo -e "${BLUE}→${NC} Running Django tests..."
if python manage.py test --verbosity=2; then
    echo -e "${GREEN}✓${NC} Django tests passed"
else
    echo -e "${RED}✗${NC} Django tests failed"
    FAILURES=$((FAILURES + 1))
fi
echo ""

deactivate
cd ..

# ============================================================================
# FRONTEND CHECKS
# ============================================================================
echo -e "${YELLOW}⚛️  Frontend Checks${NC}"
echo ""

cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found. Installing...${NC}"
    npm ci
fi

# ESLint
echo -e "${BLUE}→${NC} Running ESLint..."
if npm run lint; then
    echo -e "${GREEN}✓${NC} ESLint passed"
else
    echo -e "${RED}✗${NC} ESLint failed"
    FAILURES=$((FAILURES + 1))
fi
echo ""

# TypeScript type checking
echo -e "${BLUE}→${NC} Running TypeScript type check..."
if npx tsc --noEmit; then
    echo -e "${GREEN}✓${NC} TypeScript check passed"
else
    echo -e "${RED}✗${NC} TypeScript check failed"
    FAILURES=$((FAILURES + 1))
fi
echo ""

# Jest tests
echo -e "${BLUE}→${NC} Running Jest tests..."
if npm test -- --coverage --passWithNoTests; then
    echo -e "${GREEN}✓${NC} Jest tests passed"
else
    echo -e "${RED}✗${NC} Jest tests failed"
    FAILURES=$((FAILURES + 1))
fi
echo ""

# E2E tests (Playwright)
echo -e "${BLUE}→${NC} Running E2E tests (Playwright)..."
if npm run test:e2e; then
    echo -e "${GREEN}✓${NC} E2E tests passed"
else
    echo -e "${RED}✗${NC} E2E tests failed"
    FAILURES=$((FAILURES + 1))
fi
echo ""

cd ..

# ============================================================================
# DOCKER VALIDATION
# ============================================================================
echo -e "${YELLOW}🐳 Docker Validation${NC}"
echo ""

echo -e "${BLUE}→${NC} Validating docker-compose configuration..."
if docker-compose config > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Docker configuration valid"
else
    echo -e "${RED}✗${NC} Docker configuration invalid"
    FAILURES=$((FAILURES + 1))
fi
echo ""

# ============================================================================
# SUMMARY
# ============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ $FAILURES -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Safe to push.${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
else
    echo -e "${RED}✗ $FAILURES check(s) failed. Fix issues before pushing.${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 1
fi
