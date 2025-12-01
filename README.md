# Kanban Board - Next.js + Django GraphQL

Modern full-stack kanban board with drag-and-drop, built with Next.js 15, Django 4.2, and GraphQL.

## 🚀 Quick Start

### Docker (Recommended)

```bash
# Start everything
docker-compose up --build

# Or use Makefile shortcuts
make up              # Start services
make logs            # View logs
make test            # Run all tests
make down            # Stop services
```

**Access:**
- Frontend: http://localhost:3000
- GraphQL API: http://localhost:8000/graphql

### Local Development

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🎯 Features

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Drag-and-drop between columns (TODO → DOING → DONE)
- ✅ GraphQL API with type-safe schema
- ✅ Real-time updates with Apollo Client
- ✅ Material UI responsive design
- ✅ TypeScript end-to-end
- ✅ Docker hot-reload for both services
- ✅ Pre-commit hooks (Ruff, ESLint, Prettier)
- ✅ Comprehensive test coverage

## 🏗️ Tech Stack

**Backend:**
- Django 4.2 + Graphene-Django
- GraphQL with split schema pattern
- SQLite (dev) / PostgreSQL (production)

**Frontend:**
- Next.js 15 (App Router)
- TypeScript + Apollo Client
- Material UI v7
- @dnd-kit for drag-and-drop

**Infrastructure:**
- Docker Compose with health checks
- Pre-commit hooks (Ruff + ESLint + Prettier)
- Hot reload for development
- Multi-stage builds for production

## 📁 Project Structure

```
.
├── backend/                  # Django backend
│   ├── config/              # Project settings
│   ├── kanban/              # Kanban app
│   │   ├── models.py        # Task model
│   │   ├── schema/          # GraphQL (types, queries, mutations)
│   │   └── tests/           # Unit + integration tests
│   └── requirements.txt
│
├── frontend/                # Next.js frontend
│   ├── src/
│   │   ├── app/            # Next.js App Router
│   │   ├── components/     # React components
│   │   │   └── Board.tsx   # Main Kanban board
│   │   ├── graphql/        # GraphQL operations
│   │   └── __tests__/      # Component tests
│   └── package.json
│
├── docker-compose.yml       # Services orchestration
├── Makefile                 # Development shortcuts
└── .pre-commit-config.yaml  # Code quality hooks
```

## 🧪 Testing

```bash
# All tests
make test

# Backend only (Django)
cd backend
python manage.py test kanban.tests

# Frontend only (Jest)
cd frontend
npm test
```

**Test Coverage:**
- Backend: 20 tests (models + GraphQL API)
- Frontend: 12 tests (components + integration)
- Focus: Critical paths + enum validation

## 🔧 Pre-commit Hooks

Install and use code quality hooks:

```bash
# Install
pip install pre-commit
pre-commit install

# Run manually
pre-commit run --all-files

# Bypass for emergency
git commit --no-verify
```

**What's checked:**
- Python: Ruff (linting + formatting)
- TypeScript: ESLint + Prettier + type checking
- General: Trailing whitespace, YAML validation, large files

## 📊 Development Commands

### Makefile Shortcuts

```bash
make up                 # Start services
make down               # Stop services
make logs               # View all logs
make logs-backend       # Backend logs only
make logs-frontend      # Frontend logs only
make test               # Run all tests
make test-backend       # Backend tests only
make test-frontend      # Frontend tests only
make shell-backend      # Django shell
make shell-frontend     # Node shell
make migrate            # Run migrations
make hooks-install      # Install pre-commit
make lint               # Run linters
make format             # Format code
make clean              # Remove containers/volumes
```

### GraphQL Operations

```graphql
# Query tasks
query { allTasks { id title status createdAt } }

# Create task
mutation { createTask(title: "New Task", status: TODO) { task { id } } }

# Update task (drag-and-drop)
mutation { updateTask(id: "1", status: DOING) { task { id status } } }

# Delete task
mutation { deleteTask(id: "1") { success } }
```

## 🎨 Architecture Highlights

### Backend: Modular Monolith
- Django apps with clear boundaries
- Split GraphQL schemas (types, queries, mutations)
- Abstract base models for shared patterns
- Easy to add new modules

### Frontend: SOLID Principles
- Single responsibility components
- Custom hooks for state management
- TypeScript enums for type safety
- Modular, testable architecture

## 📖 Documentation

- `DEPLOYMENT.md` - Production deployment guide
- `INFRASTRUCTURE.md` - DevOps setup details
- `TESTING.md` - Test implementation guide
- `TEST_SUMMARY.md` - Test coverage summary

## 🚢 Production Deployment

See `DEPLOYMENT.md` for comprehensive production deployment guide including:
- Environment configuration
- Database setup (PostgreSQL)
- HTTPS/SSL configuration
- Monitoring and logging
- Backup strategies
- Security checklist

## 📄 License

MIT License - See LICENSE file for details

---

**Built with:** Next.js 15, Django 4.2, GraphQL, TypeScript, Docker
