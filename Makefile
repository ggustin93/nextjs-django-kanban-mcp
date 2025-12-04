# Makefile for Next.js + Django Kanban Board
# Provides convenient shortcuts for common Docker and development commands

.PHONY: help setup up down rebuild test migrate clean logs shell lint precommit check

# Default target
help:
	@echo "Kanban Board - Development Commands"
	@echo ""
	@echo "  make setup      First-time project setup"
	@echo "  make up         Start services"
	@echo "  make down       Stop services"
	@echo "  make test       Run all tests"
	@echo "  make check      Full CI validation"
	@echo ""
	@echo "  make lint       Auto-fix linting"
	@echo "  make precommit  Run pre-commit hooks"
	@echo "  make migrate    Run migrations"
	@echo "  make logs       View logs"
	@echo "  make shell      Django shell"
	@echo "  make clean      Remove all containers"

# First-time setup
setup:
	@echo "Setting up development environment..."
	@if [ ! -f .env ]; then cp .env.example .env && echo "Created .env from template"; fi
	docker-compose build
	docker-compose run --rm backend python manage.py migrate
	pip install pre-commit && pre-commit install
	@echo "✅ Setup complete! Run 'make up' to start."

# Essential commands
up:
	docker-compose up -d
	@echo "Services started. Backend: http://localhost:8000, Frontend: http://localhost:3000"

down:
	docker-compose down

rebuild:
	@echo "Rebuilding Docker containers..."
	docker-compose build
	docker-compose up -d
	@echo "✅ Services rebuilt and restarted"
	@echo "Backend: http://localhost:8000, Frontend: http://localhost:3000"

test:
	@echo "Running all tests..."
	cd backend && python manage.py test
	cd frontend && npm test -- --passWithNoTests
	cd frontend && npm run test:e2e

migrate:
	docker-compose exec backend python manage.py migrate

clean:
	docker-compose down -v --rmi all
	@echo "Cleaned up containers, volumes, and images"

# Development helpers
logs:
	docker-compose logs -f

shell:
	docker-compose exec backend python manage.py shell

lint:
	@echo "Linting and formatting..."
	cd backend && ruff check --fix . && ruff format .
	cd frontend && npm run lint --fix

precommit:
	pre-commit run --all-files

check:
	./scripts/check-ci.sh
