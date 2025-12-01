# Makefile for Next.js + Django Kanban Board
# Provides convenient shortcuts for common Docker and development commands

.PHONY: help build up down restart logs clean test shell migrate

# Default target
help:
	@echo "Next.js + Django Kanban Board - Development Commands"
	@echo ""
	@echo "Docker Commands:"
	@echo "  make build          - Build Docker images"
	@echo "  make up             - Start all services"
	@echo "  make down           - Stop all services"
	@echo "  make restart        - Restart all services"
	@echo "  make logs           - View logs from all services"
	@echo "  make logs-backend   - View backend logs"
	@echo "  make logs-frontend  - View frontend logs"
	@echo "  make clean          - Remove containers, volumes, and images"
	@echo ""
	@echo "Development Commands:"
	@echo "  make shell-backend  - Open shell in backend container"
	@echo "  make shell-frontend - Open shell in frontend container"
	@echo "  make migrate        - Run Django migrations"
	@echo "  make test           - Run all tests"
	@echo "  make test-backend   - Run backend tests"
	@echo "  make test-frontend  - Run frontend tests"
	@echo ""
	@echo "Pre-commit Commands:"
	@echo "  make hooks-install  - Install pre-commit hooks"
	@echo "  make hooks-run      - Run pre-commit hooks on all files"
	@echo "  make lint           - Run linters only"
	@echo "  make format         - Format code"

# Docker commands
build:
	docker-compose build

up:
	docker-compose up -d
	@echo "Services started. Backend: http://localhost:8000, Frontend: http://localhost:3000"

down:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

clean:
	docker-compose down -v --rmi all
	@echo "Cleaned up containers, volumes, and images"

# Development commands
shell-backend:
	docker-compose exec backend sh

shell-frontend:
	docker-compose exec frontend sh

migrate:
	docker-compose exec backend python manage.py migrate

test:
	@echo "Running backend tests..."
	docker-compose exec backend python manage.py test kanban.tests
	@echo "Running frontend tests..."
	docker-compose exec frontend npm test

test-backend:
	docker-compose exec backend python manage.py test kanban.tests

test-frontend:
	docker-compose exec frontend npm test

# Pre-commit hooks
hooks-install:
	pip install pre-commit
	pre-commit install
	@echo "Pre-commit hooks installed"

hooks-run:
	pre-commit run --all-files

lint:
	@echo "Linting backend..."
	cd backend && ruff check .
	@echo "Linting frontend..."
	cd frontend && npm run lint

format:
	@echo "Formatting backend..."
	cd backend && ruff format .
	@echo "Formatting frontend..."
	cd frontend && npx prettier --write "**/*.{ts,tsx,js,jsx,json,css,md}"
