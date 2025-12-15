# Kanban Frontend

Next.js 15 frontend with Apollo Client, Material-UI, and TypeScript.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **GraphQL**: Apollo Client + GraphQL Codegen
- **UI**: Material-UI 7
- **Drag & Drop**: dnd-kit
- **Testing**: Jest + Playwright

## Quick Start

```bash
npm install
npm run codegen   # Generate types from backend schema
npm run dev       # Start dev server at http://localhost:3000
```

Backend must be running at `http://localhost:8000/graphql/`.

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run codegen      # Generate TypeScript types from GraphQL
npm test             # Unit tests (35 tests)
npm run test:e2e     # Playwright E2E tests
npm run lint         # ESLint
```

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout with providers
│   └── page.tsx              # Home page
├── components/
│   └── kanban/               # Kanban board feature
│       ├── config/           # Column & priority configs
│       ├── hooks/            # Custom hooks (useTaskDialog)
│       ├── Task/             # Task components
│       ├── Board.tsx         # Main orchestrator
│       ├── KanbanColumn.tsx  # Column with drag-drop
│       ├── FilterBar.tsx     # Filters & view toggle
│       ├── EisenhowerMatrix.tsx
│       └── types.ts          # Shared types & enums
├── graphql/
│   ├── ApolloWrapper.tsx     # Apollo Client provider
│   ├── generated.ts          # Auto-generated types
│   ├── queries.ts            # GraphQL queries
│   └── mutations.ts          # GraphQL mutations
├── theme/
│   └── theme.ts              # MUI theme config
└── __tests__/                # Unit tests
```

## GraphQL Workflow

Types are auto-generated from the backend schema:

```bash
npm run codegen      # Regenerate after schema changes
```

Generated types live in `src/graphql/generated.ts`.

## Architecture

**Component Responsibilities:**

- `Board.tsx` - Orchestrates data fetching, mutations, drag-drop coordination
- `KanbanColumn.tsx` - Renders column with droppable zone
- `TaskCard.tsx` - Individual task with priority badge
- `useTaskDialog` - Dialog state management hook

**Design Principles:**

- SOLID: Single responsibility per component
- DRY: Shared types in `types.ts`, configs in `config/`
- KISS: Minimal abstraction, flat structure where practical
