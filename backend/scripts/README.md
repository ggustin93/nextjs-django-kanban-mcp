# Utility Scripts

Development and maintenance scripts for the Django project.

## Available Scripts

### export_schema.py
Export GraphQL schema to file for frontend consumption.

```bash
python scripts/export_schema.py
```

Output: `apps/kanban/graphql/schema.graphql`

### Usage Pattern

All scripts should be run from the backend directory:

```bash
cd backend
python scripts/<script_name>.py
```
