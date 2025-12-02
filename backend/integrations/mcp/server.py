#!/usr/bin/env python3
"""
Kanban MCP Server (FastMCP)
============================

Exposes kanban task operations as MCP tools for AI agents.
Supports both stdio (local) and HTTP (remote) transports.

Tools:
    - list_tasks: Get all tasks, optionally filtered by status
    - create_task: Create a new task
    - update_task: Update an existing task
    - delete_task: Delete a task by ID

Usage:
    # Local (Claude Desktop/Code)
    python mcp_server.py

    # Remote (Claude Mobile/Web)
    python mcp_server.py --http --port 8000

Environment Variables:
    TRANSPORT: 'stdio' (default) or 'http'
    PORT: HTTP server port (default: 8000)
    HOST: HTTP server host (default: 0.0.0.0)
"""
import os
import sys

# Setup Django before importing models
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django  # noqa: E402

django.setup()

from apps.kanban.models import Task  # noqa: E402
from asgiref.sync import sync_to_async  # noqa: E402
from fastmcp import FastMCP  # noqa: E402

# --- Django ORM Async Wrappers ---


@sync_to_async
def get_all_tasks(status=None):
    """Get all tasks, optionally filtered by status."""
    tasks = Task.objects.all().order_by('-created_at')
    if status:
        tasks = tasks.filter(status=status)
    return list(tasks)


@sync_to_async
def create_task_sync(title, description='', status='TODO'):
    """Create a new task."""
    return Task.objects.create(title=title, description=description, status=status)


@sync_to_async
def get_task_by_id(task_id):
    """Get a task by ID."""
    return Task.objects.get(pk=task_id)


@sync_to_async
def save_task(task):
    """Save a task."""
    task.save()
    return task


@sync_to_async
def delete_task_sync(task):
    """Delete a task."""
    task.delete()


def task_to_dict(task: Task) -> dict:
    """Convert Django Task model to dict."""
    return {
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'status': task.status,
        'created_at': task.created_at.isoformat(),
        'updated_at': task.updated_at.isoformat(),
    }


# --- FastMCP Server Setup ---

mcp = FastMCP('Kanban MCP Server')


@mcp.tool()
async def list_tasks(status: str = None) -> str:
    """
    List all kanban tasks, optionally filtered by status.

    Args:
        status: Filter by status (TODO, DOING, or DONE). If None, returns all tasks.

    Returns:
        JSON array of task objects with id, title, description, status, and timestamps.

    Examples:
        list_tasks()              # All tasks
        list_tasks("TODO")        # Only TODO tasks
        list_tasks("DONE")        # Only completed tasks
    """
    import json

    try:
        # Validate status if provided
        if status and status not in ['TODO', 'DOING', 'DONE']:
            return json.dumps({'error': f'Invalid status: {status}. Must be TODO, DOING, or DONE'})

        tasks = await get_all_tasks(status)
        result = [task_to_dict(t) for t in tasks]
        return json.dumps(result, indent=2)
    except Exception as e:
        return json.dumps({'error': str(e)})


@mcp.tool()
async def create_task(title: str, description: str = '', status: str = 'TODO') -> str:
    """
    Create a new kanban task.

    Args:
        title: Task title (required)
        description: Task description (optional)
        status: Task status - TODO, DOING, or DONE (default: TODO)

    Returns:
        JSON object with success status and the created task details.

    Examples:
        create_task("Review PR")
        create_task("Fix bug", "Update auth middleware", "DOING")
    """
    import json

    try:
        # Validate status
        if status not in ['TODO', 'DOING', 'DONE']:
            return json.dumps({'error': f'Invalid status: {status}. Must be TODO, DOING, or DONE'})

        task = await create_task_sync(title, description, status)
        return json.dumps({'success': True, 'task': task_to_dict(task)}, indent=2)
    except Exception as e:
        return json.dumps({'error': str(e)})


@mcp.tool()
async def update_task(
    id: int, title: str = None, description: str = None, status: str = None
) -> str:
    """
    Update an existing kanban task.

    Args:
        id: Task ID to update (required)
        title: New task title (optional)
        description: New task description (optional)
        status: New task status - TODO, DOING, or DONE (optional)

    Returns:
        JSON object with success status and the updated task details.

    Examples:
        update_task(5, status="DONE")
        update_task(3, title="Updated title", status="DOING")
    """
    import json

    try:
        # Validate status if provided
        if status and status not in ['TODO', 'DOING', 'DONE']:
            return json.dumps({'error': f'Invalid status: {status}. Must be TODO, DOING, or DONE'})

        task = await get_task_by_id(id)

        if title is not None:
            task.title = title
        if description is not None:
            task.description = description
        if status is not None:
            task.status = status

        await save_task(task)

        return json.dumps({'success': True, 'task': task_to_dict(task)}, indent=2)
    except Task.DoesNotExist:
        return json.dumps({'error': f'Task with id {id} not found'})
    except Exception as e:
        return json.dumps({'error': str(e)})


@mcp.tool()
async def delete_task(id: int) -> str:
    """
    Delete a kanban task by ID.

    Args:
        id: Task ID to delete (required)

    Returns:
        JSON object with success status and the deleted task details.

    Examples:
        delete_task(7)
    """
    import json

    try:
        task = await get_task_by_id(id)
        task_data = task_to_dict(task)
        await delete_task_sync(task)

        return json.dumps({'success': True, 'deleted': task_data}, indent=2)
    except Task.DoesNotExist:
        return json.dumps({'error': f'Task with id {id} not found'})
    except Exception as e:
        return json.dumps({'error': str(e)})


if __name__ == '__main__':
    import argparse

    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Kanban MCP Server')
    parser.add_argument(
        '--http', action='store_true', help='Run with HTTP transport (default: stdio)'
    )
    parser.add_argument(
        '--port',
        type=int,
        default=int(os.environ.get('PORT', 8000)),
        help='HTTP server port (default: 8000)',
    )
    parser.add_argument(
        '--host',
        default=os.environ.get('HOST', '0.0.0.0'),
        help='HTTP server host (default: 0.0.0.0)',
    )

    args = parser.parse_args()

    if args.http:
        # Remote access via HTTP
        print('🚀 Starting Kanban MCP Server (HTTP)')
        print(f'📍 Endpoint: http://{args.host}:{args.port}/sse')
        print(f'💚 Health check: http://{args.host}:{args.port}/health')
        print('\n⚙️  Claude Desktop/Code config:')
        print(f'   {{"command": "http://{args.host}:{args.port}/sse"}}')

        mcp.run(transport='sse', host=args.host, port=args.port)
    else:
        # Local access via stdio (default)
        print('🚀 Starting Kanban MCP Server (stdio)', file=sys.stderr)
        print('📍 Transport: Standard Input/Output', file=sys.stderr)
        print('✅ Ready for Claude Desktop/Code', file=sys.stderr)

        mcp.run(transport='stdio')
