# Kanban Frontend

Next.js 15 frontend with Apollo Client, Material-UI, and TypeScript.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **GraphQL**: Apollo Client + GraphQL Codegen
- **UI**: Material-UI 7
- **Drag & Drop**: dnd-kit
- **Testing**: Jest + Playwright

## Scripts

```bash
npm run dev          # Development server (port 3000)
npm run build        # Production build
npm run codegen      # Generate TypeScript types from GraphQL schema
npm run test         # Run unit tests
npm run test:e2e     # Run Playwright E2E tests
npm run lint         # ESLint
```

## GraphQL Workflow

Types are auto-generated from the backend schema:

```bash
npm run codegen      # Regenerate after schema changes
```

Generated types live in `src/graphql/generated.ts`.

## Project Structure

```
src/
├── app/                    # Next.js App Router
├── components/
│   └── kanban/             # Kanban board components
│       ├── Board.tsx       # Main orchestrator
│       ├── Task/           # Task components
│       └── types.ts        # Shared types & constants
├── graphql/
│   ├── generated.ts        # Auto-generated types
│   ├── queries.ts          # GraphQL queries
│   └── mutations.ts        # GraphQL mutations
└── lib/
    └── apolloClient.ts     # Apollo Client config
```

## Development

```bash
npm install
npm run codegen   # Generate types first
npm run dev       # Start dev server
```

Backend must be running at `http://localhost:8000/graphql/`.
