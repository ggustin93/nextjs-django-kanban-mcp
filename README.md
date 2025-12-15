# Kanban MCP — Next.js · Django · GraphQL

A task management app featuring drag-and-drop Kanban boards, Eisenhower priority matrix, GraphQL API, and MCP server for Claude AI integration.

**Stack:** Next.js 15, Django 4.2, TypeScript, Material UI, Apollo Client, Ariadne (GraphQL)

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Status](https://img.shields.io/badge/Status-POC%2FMVP-yellow)](README.md)

> **Note:** This is a Proof of Concept / MVP project showcasing modern full-stack development. Built with assistance from Claude Code.

## Screenshots

<table>
  <tr>
    <td align="center"><strong>Kanban Board</strong></td>
    <td align="center"><strong>Eisenhower Matrix</strong></td>
  </tr>
  <tr>
    <td align="center"><a href="docs/screenshots/kanban.png"><img src="docs/screenshots/kanban.png" alt="Kanban Board" width="400"/></a><br/><sub><a href="docs/screenshots/kanban.png">🔍 View full size</a></sub></td>
    <td align="center"><a href="docs/screenshots/matrix.png"><img src="docs/screenshots/matrix.png" alt="Eisenhower Matrix" width="400"/></a><br/><sub><a href="docs/screenshots/matrix.png">🔍 View full size</a></sub></td>
  </tr>
  <tr>
    <td align="center" colspan="2"><strong>Claude Desktop (MCP Client)</strong></td>
  </tr>
  <tr>
    <td colspan="2" align="center"><a href="docs/screenshots/claude.png"><img src="docs/screenshots/claude.png" alt="Claude Desktop" width="600"/></a><br/><sub><a href="docs/screenshots/claude.png">🔍 View full size</a></sub></td>
  </tr>
</table>

## Table of Contents

- [Kanban MCP — Next.js · Django · GraphQL](#kanban-mcp--nextjs--django--graphql)
  - [Screenshots](#screenshots)
  - [Table of Contents](#table-of-contents)
  - [1. Quick Start](#1-quick-start)
  - [2. Features](#2-features)
  - [3. Architecture](#3-architecture)
  - [4. Tech Stack](#4-tech-stack)
  - [5. Project Structure](#5-project-structure)
    - [Backend (Django)](#backend-django)
    - [Frontend (Next.js)](#frontend-nextjs)
    - [Root](#root)
  - [6. Development](#6-development)
  - [7. Testing](#7-testing)
  - [8. Pre-commit Hooks](#8-pre-commit-hooks)
  - [9. Continuous Integration \& Deployment](#9-continuous-integration--deployment)
  - [10. Deployment](#10-deployment)
  - [11. MCP Server Integration](#11-mcp-server-integration)
  - [12. License](#12-license)

## 1. Quick Start

```bash
# Recommended: Using Makefile
make setup      # First-time setup (creates .env, builds containers, runs migrations)
make up         # Start services

# Or with Docker directly
docker-compose up --build

# Or run services separately (without Docker)
cd backend && pip install -r requirements.txt && python manage.py migrate && python manage.py runserver
cd frontend && npm install && npm run dev
```

- Frontend: http://localhost:3000
- GraphQL API: http://localhost:8000/graphql

> **Windows**: Requires [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install) or `choco install make` for Makefile commands

## 2. Features

Dual-view task management with Kanban board and Eisenhower Matrix, featuring drag-and-drop interface, priority-based workflows, and Claude AI integration via MCP server.

<details>
<summary><strong>📋 Task Management</strong></summary>

- Dual view modes: Kanban board + Eisenhower Matrix
- Priority system (P1-P4): Do First → Schedule → Quick Win → Backlog
- Status workflow: TODO → DOING → WAITING → DONE
- Category tagging with # prefix (#frontend, #backend, etc.)
- Drag-and-drop between columns and priority quadrants
</details>

<details>
<summary><strong>🔍 Filtering & Search</strong></summary>

- Filter by priority (P1-P4) in both views
- Filter by status (To Do, Doing, Waiting, Done) in both views
- Filter by category with multi-select
- Full-text search across title, description, and category
</details>

<details>
<summary><strong>🤖 AI Integration</strong></summary>

- MCP (Model Context Protocol) server for Claude Desktop integration
- Natural language task management through Claude AI
- FastMCP-based implementation with GraphQL coordination
</details>

## 3. Architecture

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#fff', 'primaryTextColor': '#1e293b', 'primaryBorderColor': '#e2e8f0', 'lineColor': '#64748b', 'secondaryColor': '#f8fafc', 'tertiaryColor': '#f1f5f9'}}}%%
graph TB
    subgraph Presentation["🎨 Presentation Layer"]
        Browser["🌐 <b>Web Browser</b>"]
        Claude["🤖 <b>Claude Desktop</b>"]
    end

    subgraph Application["⚙️ Application Layer (Docker)"]
        subgraph Frontend["Frontend Container"]
            NextApp["<b>Next.js</b><br/>Apollo · Material UI"]
        end

        subgraph Backend["Backend Container"]
            GraphQL["<b>GraphQL API</b><br/>Ariadne"]
            MCPServer["<b>MCP Server</b><br/>FastMCP"]
            RootSchema["<b>Root Schema</b><br/>Query + Mutation"]
        end
    end

    subgraph Domain["🧩 Domain Layer"]
        CoreApp["<b>Core App</b><br/>Shared Base"]
        KanbanApp["<b>Kanban App</b><br/>Task Model"]
    end

    subgraph Infrastructure["🗄️ Infrastructure Layer"]
        ORM["<b>Django ORM</b>"]
        DB[("<b>SQLite</b>")]
    end

    %% Connections
    Browser -->|"HTTP"| NextApp
    NextApp -->|"GraphQL"| GraphQL
    Claude -->|"MCP"| MCPServer

    GraphQL --> RootSchema
    RootSchema -.->|"schema composition"| KanbanApp
    MCPServer --> KanbanApp
    KanbanApp -.->|"extends"| CoreApp

    KanbanApp --> ORM
    CoreApp --> ORM
    ORM --> DB

    %% Styling
    style Browser fill:#ede9fe,stroke:#8b5cf6,color:#5b21b6,stroke-width:2px
    style Claude fill:#ede9fe,stroke:#8b5cf6,color:#5b21b6,stroke-width:2px
    style NextApp fill:#fef3c7,stroke:#f59e0b,color:#92400e,stroke-width:2px
    style GraphQL fill:#d1fae5,stroke:#10b981,color:#065f46,stroke-width:2px
    style MCPServer fill:#d1fae5,stroke:#10b981,color:#065f46,stroke-width:2px
    style RootSchema fill:#d1fae5,stroke:#10b981,color:#065f46
    style CoreApp fill:#fecaca,stroke:#ef4444,color:#991b1b
    style KanbanApp fill:#fecaca,stroke:#ef4444,color:#991b1b,stroke-width:2px
    style ORM fill:#dbeafe,stroke:#3b82f6,color:#1e40af,stroke-width:2px
    style DB fill:#dbeafe,stroke:#3b82f6,color:#1e40af,stroke-width:2px

    style Presentation fill:#f8fafc,stroke:#cbd5e1,stroke-width:2px
    style Application fill:#f8fafc,stroke:#cbd5e1,stroke-width:2px
    style Frontend fill:#fffbeb,stroke:#f59e0b,stroke-dasharray:5 5
    style Backend fill:#ecfdf5,stroke:#10b981,stroke-dasharray:5 5
    style Domain fill:#f8fafc,stroke:#cbd5e1,stroke-width:2px
    style Infrastructure fill:#f8fafc,stroke:#cbd5e1,stroke-width:2px
```

**Layered architecture:** Presentation (clients) → Application (APIs) → Domain (business logic) → Infrastructure (data). Two interfaces to one backend: Browser via GraphQL with schema composition, Claude via MCP with direct model access.

## 4. Tech Stack

| Category | Technologies |
|----------|-------------|
| **Backend** | ![Django](https://img.shields.io/badge/Django-4.2-092E20?logo=django&logoColor=white) ![GraphQL](https://img.shields.io/badge/GraphQL-E10098?logo=graphql&logoColor=white) ![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white) |
| **Frontend** | ![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) ![Material UI](https://img.shields.io/badge/Material_UI-v7-007FFF?logo=mui&logoColor=white) |
| **API Layer** | ![Apollo](https://img.shields.io/badge/Apollo_Client-311C87?logo=apollo-graphql&logoColor=white) ![Ariadne](https://img.shields.io/badge/Ariadne-E10098?logo=graphql&logoColor=white) ![Codegen](https://img.shields.io/badge/GraphQL_Codegen-E10098?logo=graphql&logoColor=white) |
| **Infrastructure** | ![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white) ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?logo=github-actions&logoColor=white) |
| **AI Integration** | ![MCP](https://img.shields.io/badge/MCP_Server-FastMCP-5A67D8?logo=anthropic&logoColor=white) |
| **Dev Tools** | ![Ruff](https://img.shields.io/badge/Ruff-D7FF64?logo=ruff&logoColor=black) ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?logo=eslint&logoColor=white) ![Prettier](https://img.shields.io/badge/Prettier-F7B93E?logo=prettier&logoColor=black) |

## 5. Project Structure

### Backend (Django)

```
backend/
├── apps/
│   ├── core/                  # Shared base models (TimeStampedModel)
│   └── kanban/                # Kanban feature app
│       ├── models.py          # Task model
│       ├── graphql/           # Ariadne GraphQL (schema-first)
│       │   ├── schema.graphql # SDL schema (source of truth)
│       │   ├── types.py       # Scalar + enum bindings
│       │   ├── queries.py     # allTasks resolver
│       │   └── mutations.py   # CRUD resolvers
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
│   ├── generated.ts           # Auto-generated types (GraphQL Codegen)
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

## 6. Development

| Command | Description |
|---------|-------------|
| `make setup` | First-time project setup |
| `make up` / `make down` | Start/stop Docker services |
| `make test` | Run all tests (unit + integration + E2E) |
| `make lint` | Auto-fix linting issues |
| `make codegen` | Regenerate TypeScript types from GraphQL schema |
| `make logs` / `make shell` | View logs / Django shell |

**GraphQL Playground**: http://localhost:8000/graphql — Query, create, update, delete tasks.

> **Windows**: Use [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install) or `choco install make`

## 7. Testing

**Testing Trophy** approach — prioritizing integration tests for maximum confidence with minimal maintenance.

| Layer | Tests | Tools |
|-------|-------|-------|
| 🎭 E2E | 1 | Playwright |
| **🧪 Integration** | **37** | **Jest + RTL** |
| 🔬 Unit | 32 | Django |
| 📏 Static | — | TypeScript, ESLint, Ruff |

```bash
make test       # Run all tests (unit + integration + e2e)
make check      # Full CI validation
```

## 8. Pre-commit Hooks

Automated code quality checks before each commit.

```bash
pip install pre-commit && pre-commit install   # Setup (one-time)
make precommit                                  # Run manually
make lint                                       # Auto-fix issues
```

## 9. Continuous Integration & Deployment

Automated quality gates ensure code quality and deployment safety through parallel validation and staged deployment.

```mermaid
graph LR
    A[💾 Commit] --> B[🔍 CI Pipeline]
    B --> C{Quality Gates}
    C -->|Lint| D[✓ Backend Ruff]
    C -->|Lint| E[✓ Frontend ESLint]
    C -->|Test| F[✓ Django Tests]
    C -->|Test| G[✓ Jest Tests]
    C -->|E2E| P[✓ Playwright]
    C -->|Build| H[✓ Docker Images]
    D --> I[🏗️ Build Artifacts]
    E --> I
    F --> I
    G --> I
    P --> I
    H --> I
    I --> J[🚀 Deploy Staging]
    J --> K[👤 Manual Approval]
    K --> L[🌐 Production]

    style A fill:#e1f5ff,stroke:#01579b
    style B fill:#fff9c4,stroke:#f57f17
    style C fill:#fff3e0,stroke:#e65100
    style I fill:#e8f5e9,stroke:#2e7d32
    style J fill:#f3e5f5,stroke:#4a148c
    style L fill:#c8e6c9,stroke:#1b5e20
```

**Quality Validations:** Backend/Frontend linting, unit tests, E2E tests (Playwright), TypeScript checks, Docker builds
**Deployment:** Staging auto-deploy → Manual production approval with health checks

## 10. Deployment

**Deployment Features:**
- Automated CI/CD pipeline (`.github/workflows/`)
- Docker multi-stage builds with health checks
- Environment-based configuration (12-factor app)

**Deploy to:**
- **Cloud**: AWS ECS, GCP Cloud Run, Azure Container Instances
- **PaaS**: Vercel (frontend) + Render/Railway (backend)
- **Self-hosted**: Docker Compose with Nginx reverse proxy

```bash
# Production build
docker-compose -f docker-compose.prod.yml up --build
```

## 11. MCP Server Integration

[Model Context Protocol](https://modelcontextprotocol.io/) server for task management through Claude AI.

**Setup:** Configure Claude Desktop with `backend/integrations/mcp/server.py` path
**Operations:** List, create, update, delete tasks via natural language
**Deployment:** Supports stdio (local) and HTTP/SSE (remote) transport

**📚 API Documentation:** [GraphQL Playground](http://localhost:8000/graphql) | [Schema Reference](backend/kanban/graphql/schema.graphql)

See `backend/integrations/mcp/README.md` for configuration details.

## 12. License

MIT License
