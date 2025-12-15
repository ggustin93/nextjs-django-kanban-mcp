# Kanban Backend

Django 4.2 backend with Ariadne GraphQL API.

## Tech Stack

- **Framework**: Django 4.2
- **GraphQL**: Ariadne (schema-first)
- **Database**: SQLite (dev), PostgreSQL-ready
- **Testing**: pytest + Django TestCase

## Quick Start

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_tasks   # Optional: seed sample data
python manage.py runserver    # http://localhost:8000/graphql/
```

## Scripts

```bash
python manage.py runserver              # Dev server
python manage.py test                   # Run all tests (20 tests)
python manage.py seed_tasks             # Create sample tasks
python manage.py seed_tasks --clear     # Clear + seed
python scripts/export_schema.py         # Export GraphQL schema
ruff check .                            # Lint
ruff format .                           # Format
```

## Project Structure

```
backend/
├── config/                  # Django project settings
│   ├── settings.py
│   ├── urls.py              # GraphQL endpoint: /graphql/
│   └── schema.py            # Root GraphQL schema
├── apps/
│   ├── core/                # Shared models
│   │   └── models.py        # TimeStampedModel base
│   └── kanban/              # Kanban feature app
│       ├── models.py        # Task model
│       ├── graphql/         # GraphQL schema (Ariadne)
│       │   ├── types.py     # Type definitions
│       │   ├── queries.py   # Query resolvers
│       │   └── mutations.py # Mutation resolvers
│       ├── tests/           # App tests
│       └── management/      # seed_tasks command
├── integrations/
│   └── mcp/                 # MCP server integration
├── tests/                   # Integration tests
└── scripts/                 # Utility scripts
```

## GraphQL API

**Endpoint**: `http://localhost:8000/graphql/`

**Operations**:
- `allTasks` - List tasks (with optional status filter)
- `task(id)` - Get single task
- `createTask(...)` - Create task
- `updateTask(...)` - Update task
- `deleteTask(id)` - Delete task

**Schema Export**:
```bash
python scripts/export_schema.py
# Output: apps/kanban/graphql/schema.graphql
```

## Architecture

**OpenHEXA-Inspired Patterns**:
- Modular apps with clear boundaries
- Schema-first GraphQL (Ariadne)
- Abstract base models (`TimeStampedModel`)
- Split GraphQL by concern (types/queries/mutations)

**Testing Strategy**:
- Model tests: CRUD operations
- Schema tests: GraphQL query/mutation validation
- MCP tests: Integration layer verification
