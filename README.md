# Kanban MCP — Next.js · Django · GraphQL

A modern task management app featuring drag-and-drop Kanban boards, Eisenhower priority matrix, GraphQL API, and an MCP server for seamless Claude AI integration.

**Stack:** Next.js 15, Django 4.2, TypeScript, Material UI, Apollo Client, Graphene-Django

## Screenshots

<table>
  <tr>
    <td align="center"><strong>Kanban Board</strong></td>
    <td align="center"><strong>Eisenhower Matrix</strong></td>
  </tr>
  <tr>
    <td align="center"><a href="docs/screenshots/kanban.png"><img src="docs/screenshots/kanban.png" alt="Kanban Board" width="400"/></a><br/><sub><a href="docs/screenshots/kanban.png">🔍 View full size</a></sub></td>
    <td align="center"><a href="docs/screenshots/eisenhower.png"><img src="docs/screenshots/eisenhower.png" alt="Eisenhower Matrix" width="400"/></a><br/><sub><a href="docs/screenshots/eisenhower.png">🔍 View full size</a></sub></td>
  </tr>
  <tr>
    <td align="center" colspan="2"><strong>Claude Desktop (MCP Client)</strong></td>
  </tr>
  <tr>
    <td colspan="2" align="center"><a href="docs/screenshots/claude.png"><img src="docs/screenshots/claude.png" alt="Claude Desktop" width="600"/></a><br/><sub><a href="docs/screenshots/claude.png">🔍 View full size</a></sub></td>
  </tr>
</table>

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [Features](#2-features)
3. [Tech Stack](#3-tech-stack)
4. [Project Structure](#4-project-structure)
5. [Testing](#5-testing)
6. [Pre-commit Hooks](#6-pre-commit-hooks)
7. [Continuous Integration](#7-continuous-integration)
8. [Development Commands](#8-development-commands)
9. [Deployment](#9-deployment)
10. [Architecture](#10-architecture)
11. [MCP Server Integration](#11-mcp-server-integration)
12. [License](#12-license)

## 1. Quick Start

```bash
# With Docker
docker-compose up --build

# Or separately
cd backend && pip install -r requirements.txt && python manage.py migrate && python manage.py runserver
cd frontend && npm install && npm run dev
```

- Frontend: http://localhost:3000
- GraphQL API: http://localhost:8000/graphql

## 2. Features

**Task Management:**
- Dual view modes: Kanban board + Eisenhower Matrix
- Priority system (P1-P4): Do First → Schedule → Quick Win → Backlog
- Status workflow: TODO → DOING → WAITING → DONE
- Category tagging with # prefix (#frontend, #backend, etc.)
- Drag-and-drop between columns and priority quadrants

**Filtering & Search:**
- Filter by priority (P1-P4) in both views
- Filter by status (To Do, Doing, Waiting, Done) in both views
- Filter by category with multi-select
- Full-text search across title, description, and category

**Technical Stack:**
- GraphQL API with type-safe Apollo Client
- TypeScript end-to-end with Material UI
- Docker development environment with hot-reload
- Pre-commit hooks (Ruff, ESLint, Prettier)
- MCP server for Claude AI integration

## 3. Tech Stack

**Backend:** Django 4.2, Graphene-Django, SQLite  
**Frontend:** Next.js 15, TypeScript, Apollo Client, Material UI v7, @dnd-kit  
**Infrastructure:** Docker Compose, pre-commit hooks (Ruff, ESLint, Prettier)

## 4. Project Structure

### Backend (Django)

```
backend/
├── apps/
│   ├── core/                  # Shared base models (TimeStampedModel)
│   └── kanban/                # Kanban feature app
│       ├── models.py          # Task model
│       ├── schema/            # GraphQL layer
│       │   ├── types.py       # TaskType definition
│       │   ├── queries.py     # allTasks query
│       │   └── mutations.py   # create/update/delete
│       ├── tests/             # Model + API tests
│       └── management/        # seed_tasks command
├── config/                    # Project configuration
│   ├── settings.py            # Django settings
│   ├── urls.py                # URL routing (/graphql)
│   └── schema.py              # Root GraphQL schema
├── integrations/mcp/          # MCP server for Claude AI
├── scripts/                   # Utility scripts
└── tests/                     # Integration tests
```

### Frontend (Next.js)

```
frontend/src/
├── app/                       # Next.js App Router (layout, pages)
├── components/
│   ├── ApolloWrapper.tsx      # Apollo Client provider
│   └── kanban/                # Kanban feature module
│       ├── Board.tsx          # Main orchestrator
│       ├── KanbanColumn.tsx   # Column layout
│       ├── FilterBar.tsx      # Filters + view toggle
│       ├── EisenhowerMatrix.tsx
│       ├── useTaskDialog.ts   # Dialog state hook
│       ├── types.ts           # Types + constants
│       ├── index.ts           # Barrel exports
│       └── Task/              # Task components
│           ├── TaskCard.tsx
│           └── TaskDialog.tsx
├── graphql/                   # Apollo Client layer
│   ├── client.ts              # Apollo Client setup
│   ├── queries.ts             # GET_TASKS query
│   └── mutations.ts           # CREATE/UPDATE/DELETE
└── theme/                     # Material UI theme
```

### Root

```
├── docker-compose.yml         # Services orchestration
├── Makefile                   # Development shortcuts
└── .pre-commit-config.yaml    # Code quality hooks
```

## 5. Testing

```bash
make test                                      # All tests
docker-compose exec backend python manage.py test  # Backend
cd frontend && npm test                        # Frontend
```

Coverage: Backend (20 tests), Frontend (12 tests)

## 6. Pre-commit Hooks

```bash
pip install pre-commit && pre-commit install
pre-commit run --all-files  # Manual run
```

Checks: Ruff (Python), ESLint + Prettier (TypeScript), YAML validation

## 7. Continuous Integration

GitHub Actions on push/PR: Backend linting (Ruff), Frontend linting (ESLint), Backend tests (Django), Frontend tests (Jest), Docker build validation.

## 8. Development Commands

```bash
make up/down         # Start/stop services
make test/migrate    # Run tests/migrations
make logs/shell      # View logs/Django shell
```

**GraphQL API** (http://localhost:8000/graphql):
- Query: `allTasks { id title status priority category }`
- Create: `createTask(title: "Task", status: TODO, priority: P1)`
- Update: `updateTask(id: "1", status: DOING)`
- Delete: `deleteTask(id: "1")`

## 9. Deployment

**Development:** Docker Compose (configured)  
**Production:** Requires PostgreSQL migration, Gunicorn setup, CORS configuration

Deployment options: Vercel (frontend) + Render/Railway (backend) or self-hosted VPS with Docker Compose.

## 10. Architecture

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#fff', 'primaryTextColor': '#1e293b', 'primaryBorderColor': '#e2e8f0', 'lineColor': '#64748b', 'secondaryColor': '#f8fafc', 'tertiaryColor': '#f1f5f9'}}}%%
graph LR
    subgraph Clients[" "]
        Browser["🌐 <b>Browser</b>"]
        Claude["🤖 <b>Claude Desktop</b>"]
    end

    subgraph Docker["🐳 Docker Compose"]
        subgraph FE["Frontend"]
            Next["<b>Next.js 15</b><br/>Apollo · MUI · dnd-kit"]
        end

        subgraph BE["Backend"]
            GraphQL["<b>GraphQL API</b><br/>Graphene-Django"]
            MCP["<b>MCP Server</b><br/>FastMCP"]
            ORM["<b>Django ORM</b><br/>Task Model"]
            DB[("<b>SQLite</b>")]
        end
    end

    Browser --> Next
    Next -->|"<i>GraphQL</i>"| GraphQL
    Claude -->|"<i>stdio / HTTP</i>"| MCP
    GraphQL --> ORM
    MCP --> ORM
    ORM --> DB

    style Browser fill:#ede9fe,stroke:#8b5cf6,color:#5b21b6
    style Claude fill:#ede9fe,stroke:#8b5cf6,color:#5b21b6
    style Next fill:#fef3c7,stroke:#f59e0b,color:#92400e
    style GraphQL fill:#d1fae5,stroke:#10b981,color:#065f46
    style MCP fill:#d1fae5,stroke:#10b981,color:#065f46
    style ORM fill:#d1fae5,stroke:#10b981,color:#065f46
    style DB fill:#dbeafe,stroke:#3b82f6,color:#1e40af
```

**Two interfaces, one backend:** Browser via GraphQL, Claude via MCP — both operate on the same Task model.

## 11. MCP Server Integration

[Model Context Protocol](https://modelcontextprotocol.io/) server for task management through Claude AI.

**Setup:** Configure Claude Desktop with `backend/integrations/mcp/server.py` path  
**Operations:** List, create, update, delete tasks via natural language  
**Deployment:** Supports stdio (local) and HTTP/SSE (remote) transport

See `backend/integrations/mcp/README.md` for configuration details.

## 12. License

MIT License
