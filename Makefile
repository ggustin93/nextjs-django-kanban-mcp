# Makefile for Next.js + Django Kanban Board
# Provides convenient shortcuts for common Docker and development commands

.PHONY: help up down test migrate clean logs shell hooks-install lint

# Default target
help:
	@echo "Next.js + Django Kanban Board - Development Commands"
	@echo ""
	@echo "  make up              - Start all services"
	@echo "  make down            - Stop all services"
	@echo "  make test            - Run all tests"
	@echo "  make migrate         - Run migrations"
	@echo "  make clean           - Remove containers/volumes"
	@echo "  make logs            - View logs"
	@echo "  make shell           - Django shell"
	@echo "  make lint            - Lint and format code"
	@echo "  make hooks-install   - Install pre-commit hooks"

# Essential commands
up:
	docker-compose up -d
	@echo "Services started. Backend: http://localhost:8000, Frontend: http://localhost:3000"

down:
	docker-compose down

test:
	@echo "Running backend tests..."
	docker-compose exec backend python manage.py test
	@echo "Running frontend tests..."
	docker-compose exec frontend npm test

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

hooks-install:
	pip install pre-commit
	pre-commit install
	@echo "✅ Pre-commit hooks installed"

lint:
	@echo "Linting and formatting backend..."
	cd backend && ruff check --fix . && ruff format .
	@echo "Linting and formatting frontend..."
	cd frontend && npm run lint --fix && npx prettier --write "src/**/*.{ts,tsx}"
