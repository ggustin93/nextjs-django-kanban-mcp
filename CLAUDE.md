# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Portfolio Project**: Full-stack kanban board demonstrating OpenHEXA architecture patterns for Bluesquare position.

**Tech Stack**:
- **Backend**: Django 4.2+ with Graphene-Django (GraphQL API), SQLite
- **Frontend**: Next.js 15 with Apollo Client, Material-UI, TypeScript
- **Infrastructure**: Docker Compose for local development
- **Architecture**: Modular Monolith following OpenHEXA patterns

**Key Architectural Decisions**:
- Split GraphQL schemas by app (senior pattern for maintainability)
- Abstract base models for DRY principle (core/TimeStampedModel)
- Feature-based apps (kanban) with organized schema/ directories
- Container-first development with hot-reload support

## Project Documentation Structure

This project uses a `.claude/` directory for organized documentation:

- **`.claude/plans/`**: Implementation plans and architecture decisions
  - `30-11-25-GEMINI3-plan.md`: Original step-by-step implementation guide
  - Other planning documents for feature development

- **`.claude/knowledge/`**: Reference materials and context
  - `job_offer_bluesquare.md`: Position requirements and company context
  - Technical references and architectural decisions

**When working on this project**: Check `.claude/plans/` for implementation roadmaps and `.claude/knowledge/` for background context.

## Development Commands

### Backend (Django)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Database operations
python manage.py makemigrations
python manage.py migrate

# Seed development data
python manage.py seed_tasks           # Create 10 sample tasks
python manage.py seed_tasks --clear   # Clear existing tasks first

# Export GraphQL schema
python export_schema.py backend/kanban/graphql/schema.graphql

# Run development server
python manage.py runserver
# API available at: http://localhost:8000/graphql/
```

### Frontend (Next.js)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Development server
npm run dev
# App available at: http://localhost:3000

# Build for production
npm run build

# Start production server
npm start

# Linting
npm run lint
```

### Docker (Recommended for Development)

```bash
# From project root - starts both backend and frontend with hot-reload
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Access running containers
docker-compose exec backend python manage.py shell
docker-compose exec frontend npm run lint
```

**Docker Setup Benefits**:
- Consistent environment across team members
- Hot-reload enabled for both backend and frontend
- No need to manage Python virtual environments or Node versions
- Services: Backend (port 8000), Frontend (port 3000)

## Architecture

### Backend Structure

**GraphQL Schema Organization** (Multi-App Pattern):
- `config/schema.py`: Root Query and Mutation classes that inherit from all app schemas
- `kanban/schema/`: App-specific GraphQL definitions
  - `types.py`: GraphQL types (TaskType)
  - `queries.py`: Query classes (allTasks)
  - `mutations.py`: Mutation classes (createTask)
- `kanban/graphql/schema.graphql`: Exported schema for frontend consumption

**Models Architecture**:
- `kanban/models.py`:
  - `TimeStampedModel`: Abstract base model providing created_at/updated_at timestamps
  - `Task`: Kanban task with title, description, and status (TODO/DOING/DONE)
  - Status choices defined as nested `Task.Status` class using Django's TextChoices

**URL Configuration**:
- Single GraphQL endpoint: `/graphql/`
- CSRF disabled for API endpoint (standard for GraphQL)
- GraphiQL enabled in development for API exploration

**CORS Configuration**:
- Configured in `config/settings.py` via `CORS_ALLOWED_ORIGINS`
- Default allows `http://localhost:3000` for Next.js frontend

### Frontend Structure

**GraphQL Client Setup**:
- Apollo Client configured in `src/lib/apolloClient.ts`
- GraphQL operations separated into:
  - `src/graphql/queries.ts`: Read operations (GET_TASKS)
  - `src/graphql/mutations.ts`: Write operations (CREATE_TASK)
- Apollo wrapper in `src/components/ApolloWrapper.tsx` provides client context

**Component Architecture** (SOLID Principles Applied):
- `src/components/Board.tsx`: Main orchestrator component (data fetching, mutations, coordination)
- `src/components/kanban/`: Modular kanban components following Single Responsibility Principle
  - `types.ts`: Shared TypeScript types and constants (TaskStatus enum, Column interface)
  - `TaskCard.tsx`: Individual draggable task card component
  - `KanbanColumn.tsx`: Column component rendering tasks with drag-and-drop zones
  - `TaskDialog.tsx`: Task creation/editing form dialog
  - `useTaskDialog.ts`: Custom hook for dialog state management
- Material-UI theme customization in `src/theme/theme.ts`
- App providers configured in `src/app/providers.tsx`

**Component Design Patterns**:
- **DRY**: Shared constants (REFETCH_QUERIES, COLUMNS, TaskStatus enum)
- **KISS**: Simple, focused components with clear responsibilities
- **YAGNI**: No premature abstractions or unused features
- **Testability**: Components can be tested in isolation

**Routing**:
- App Router (Next.js 15) with `/tasks` route
- Server components by default, client components marked with 'use client'

## Key Implementation Details

### Adding New GraphQL Operations

1. **Backend**: Add mutations/queries to `backend/kanban/schema/`
2. **Update Root Schema**: Ensure `config/schema.py` inherits new operations
3. **Export Schema**: Run `python export_schema.py backend/kanban/graphql/schema.graphql`
4. **Frontend**: Add TypeScript operations to `frontend/src/graphql/`

### Django Management Commands

Custom commands live in `backend/kanban/management/commands/`:
- Follow Django's Command pattern with `handle()` method
- Use `add_arguments()` for command-line options
- Example: `seed_tasks.py` for development data

### Database

- SQLite for development (db.sqlite3)
- Migrations tracked in `backend/kanban/migrations/`
- Initial migration (0001_initial.py) creates Task table with timestamps

### Schema Export Workflow

The `export_schema.py` script generates GraphQL schema for frontend consumption:
- Reads from Django's Graphene schema
- Outputs to `backend/kanban/graphql/schema.graphql`
- Run after any schema changes to keep frontend in sync

## Important Patterns

### OpenHEXA Architecture (Modular Monolith)

This project mirrors the [OpenHEXA architecture](https://github.com/BLSQ/openhexa) used at Bluesquare:

**Core Principles**:
1. **Modular Apps**: Each feature is a Django app with clear boundaries
2. **Shared Core**: Common patterns (TimeStampedModel) in abstract base classes
3. **Split Schemas**: GraphQL operations organized by concern (types, queries, mutations)
4. **Composition Over Inheritance**: Root schema composes app-specific schemas

**Why This Matters**:
- **Maintainability**: Changes to one app don't affect others
- **Scalability**: Easy to add new apps (users, analytics, etc.)
- **Team Collaboration**: Clear ownership boundaries for different features
- **Testing**: Apps can be tested in isolation

**Interview Talking Point**:
> "I structured this application to mirror the OpenHEXA architecture found in Bluesquare's repositories. I utilized a modular app structure with split GraphQL schemas for maintainability, and Docker Compose for a consistent development environment."

### GraphQL Multi-App Pattern

When adding new Django apps with GraphQL:
1. Create `new_app/schema/` with types, queries, mutations
2. Update `config/schema.py` to inherit from new app's Query/Mutation classes
3. Export updated schema for frontend consumption

**Example - Adding a "users" app**:
```python
# config/schema.py
import kanban.schema
import users.schema  # New import

class Query(kanban.schema.Query, users.schema.Query, graphene.ObjectType):
    pass

class Mutation(kanban.schema.Mutation, users.schema.Mutation, graphene.ObjectType):
    pass
```

This pattern allows modular GraphQL schema composition at scale.

### DRY with Abstract Models

The `TimeStampedModel` pattern prevents timestamp duplication:
- Defined once in `kanban/models.py` (would move to `core/models.py` for multi-app)
- All models inherit automatic `created_at`/`updated_at` fields
- Consistent timestamp behavior across entire application

### Frontend-Backend Type Safety

- Backend exports GraphQL schema to `backend/kanban/graphql/schema.graphql`
- Frontend can use this for type generation (not yet configured)
- Keep schema export up-to-date after backend changes

### Material-UI Integration

- Uses `@mui/material-nextjs` for Next.js App Router compatibility
- Theme provider in `src/app/providers.tsx`
- Custom theme configuration in `src/theme/theme.ts`
