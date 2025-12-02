# MCP Integration

Model Context Protocol (MCP) server exposing kanban task operations to AI agents.

## Quick Start

```bash
# Local mode (stdio)
python -m integrations.mcp.server

# Remote mode (HTTP)
python -m integrations.mcp.server --http --port 8000
```

## Available Tools

- `list_tasks`: Get all tasks, optionally filtered by status
- `create_task`: Create a new task
- `update_task`: Update an existing task
- `delete_task`: Delete a task by ID

## Configuration

Set environment variables:

```bash
TRANSPORT=stdio  # or 'http'
PORT=8000
HOST=0.0.0.0
```

## Testing

```bash
pytest tests/integration/test_mcp_server.py
```
