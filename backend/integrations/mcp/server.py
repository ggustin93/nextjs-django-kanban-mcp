#!/usr/bin/env python3
"""
Kanban MCP Server (FastMCP)
============================

Exposes kanban task operations as MCP tools for AI agents.
Supports both stdio (local) and HTTP (remote) transports.

Tools:
    - list_tasks: Get all tasks, optionally filtered by status, priority, or category
    - create_task: Create a new task with title, description, status, priority, and category
    - update_task: Update an existing task's fields
    - delete_task: Delete a task by ID

Task Status Options:
    - TODO: Task not yet started
    - DOING: Task in progress
    - WAITING: Task waiting for external input
    - DONE: Task completed

Task Priority Options (Eisenhower-inspired):
    - P1: Do First (urgent & important)
    - P2: Schedule (important, not urgent)
    - P3: Quick Win (small tasks to knock out)
    - P4: Backlog (do later)

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
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django  # noqa: E402

django.setup()

from asgiref.sync import sync_to_async  # noqa: E402
from fastmcp import FastMCP  # noqa: E402

from apps.kanban.models import Task  # noqa: E402

# --- Constants for validation ---

VALID_STATUSES = ["TODO", "DOING", "WAITING", "DONE"]
VALID_PRIORITIES = ["P1", "P2", "P3", "P4"]

# --- Django ORM Async Wrappers ---


@sync_to_async
def get_all_tasks(
    status: str | None = None,
    priority: str | None = None,
    category: str | None = None,
) -> list:
    """
    Get all tasks with optional filters.

    Args:
        status: Filter by status (TODO, DOING, WAITING, DONE)
        priority: Filter by priority (P1, P2, P3, P4)
        category: Filter by category (case-insensitive partial match)

    Returns:
        List of Task objects ordered by priority and creation date
    """
    # Model already orders by priority and -created_at
    tasks = Task.objects.all()

    if status:
        tasks = tasks.filter(status=status)
    if priority:
        tasks = tasks.filter(priority=priority)
    if category:
        tasks = tasks.filter(category__icontains=category)

    return list(tasks)


@sync_to_async
def create_task_sync(
    title: str,
    description: str = "",
    status: str = "TODO",
    priority: str = "P4",
    category: str = "",
) -> Task:
    """
    Create a new task with all fields.

    Args:
        title: Task title (required)
        description: Task description
        status: Task status (default: TODO)
        priority: Task priority (default: P4)
        category: Task category

    Returns:
        Created Task object
    """
    return Task.objects.create(
        title=title,
        description=description,
        status=status,
        priority=priority,
        category=category,
    )


@sync_to_async
def get_task_by_id(task_id: int) -> Task:
    """
    Get a task by ID.

    Args:
        task_id: Task primary key

    Returns:
        Task object

    Raises:
        Task.DoesNotExist: If task not found
    """
    return Task.objects.get(pk=task_id)


@sync_to_async
def save_task(task: Task) -> Task:
    """
    Save a task to database.

    Args:
        task: Task object to save

    Returns:
        Saved Task object
    """
    task.save()
    return task


@sync_to_async
def delete_task_sync(task: Task) -> None:
    """
    Delete a task from database.

    Args:
        task: Task object to delete
    """
    task.delete()


def task_to_dict(task: Task) -> dict:
    """
    Convert Django Task model to dictionary.

    Args:
        task: Task model instance

    Returns:
        Dictionary with all task fields including priority and category
    """
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "status": task.status,
        "priority": task.priority,
        "category": task.category,
        "created_at": task.created_at.isoformat(),
        "updated_at": task.updated_at.isoformat(),
    }


# --- FastMCP Server Setup ---

mcp = FastMCP("Kanban MCP Server")


@mcp.tool()
async def list_tasks(
    status: str = None,
    priority: str = None,
    category: str = None,
) -> str:
    """
    List all kanban tasks with optional filters.

    Args:
        status: Filter by status (TODO, DOING, WAITING, or DONE). If None, returns all.
        priority: Filter by priority (P1, P2, P3, or P4). If None, returns all.
        category: Filter by category (case-insensitive partial match). If None, returns all.

    Returns:
        JSON array of task objects with id, title, description, status, priority,
        category, and timestamps.

    Examples:
        list_tasks()                           # All tasks
        list_tasks(status="TODO")              # Only TODO tasks
        list_tasks(priority="P1")              # Only P1 tasks
        list_tasks(status="DOING", priority="P1")  # P1 tasks in progress
        list_tasks(category="frontend")        # Tasks with "frontend" in category
    """
    import json

    try:
        # Validate status if provided
        if status and status not in VALID_STATUSES:
            return json.dumps(
                {"error": f"Invalid status: {status}. Must be one of: {', '.join(VALID_STATUSES)}"}
            )

        # Validate priority if provided
        if priority and priority not in VALID_PRIORITIES:
            return json.dumps(
                {
                    "error": f"Invalid priority: {priority}. Must be one of: {', '.join(VALID_PRIORITIES)}"
                }
            )

        tasks = await get_all_tasks(status=status, priority=priority, category=category)
        result = [task_to_dict(t) for t in tasks]
        return json.dumps(result, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})


@mcp.tool()
async def create_task(
    title: str,
    description: str = "",
    status: str = "TODO",
    priority: str = "P4",
    category: str = "",
) -> str:
    """
    Create a new kanban task.

    Args:
        title: Task title (required)
        description: Task description (optional)
        status: Task status - TODO, DOING, WAITING, or DONE (default: TODO)
        priority: Task priority - P1, P2, P3, or P4 (default: P4)
            - P1: Do First (urgent & important)
            - P2: Schedule (important, not urgent)
            - P3: Quick Win (small tasks to knock out)
            - P4: Backlog (do later)
        category: Task category, typically prefixed with # (optional, e.g., "#frontend")

    Returns:
        JSON object with success status and the created task details.

    Examples:
        create_task("Review PR")
        create_task("Fix bug", "Update auth middleware", "DOING", "P1")
        create_task("Refactor UI", category="#frontend", priority="P2")
        create_task("Update docs", status="TODO", priority="P3", category="#documentation")
    """
    import json

    try:
        # Validate status
        if status not in VALID_STATUSES:
            return json.dumps(
                {"error": f"Invalid status: {status}. Must be one of: {', '.join(VALID_STATUSES)}"}
            )

        # Validate priority
        if priority not in VALID_PRIORITIES:
            return json.dumps(
                {
                    "error": f"Invalid priority: {priority}. Must be one of: {', '.join(VALID_PRIORITIES)}"
                }
            )

        task = await create_task_sync(
            title=title,
            description=description,
            status=status,
            priority=priority,
            category=category,
        )
        return json.dumps({"success": True, "task": task_to_dict(task)}, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})


@mcp.tool()
async def update_task(
    id: int,
    title: str = None,
    description: str = None,
    status: str = None,
    priority: str = None,
    category: str = None,
) -> str:
    """
    Update an existing kanban task.

    Args:
        id: Task ID to update (required)
        title: New task title (optional)
        description: New task description (optional)
        status: New task status - TODO, DOING, WAITING, or DONE (optional)
        priority: New task priority - P1, P2, P3, or P4 (optional)
        category: New task category (optional)

    Returns:
        JSON object with success status and the updated task details.

    Examples:
        update_task(5, status="DONE")
        update_task(3, title="Updated title", status="DOING")
        update_task(7, priority="P1", category="#urgent")
        update_task(2, status="WAITING", priority="P2")
    """
    import json

    try:
        # Validate status if provided
        if status and status not in VALID_STATUSES:
            return json.dumps(
                {"error": f"Invalid status: {status}. Must be one of: {', '.join(VALID_STATUSES)}"}
            )

        # Validate priority if provided
        if priority and priority not in VALID_PRIORITIES:
            return json.dumps(
                {
                    "error": f"Invalid priority: {priority}. Must be one of: {', '.join(VALID_PRIORITIES)}"
                }
            )

        task = await get_task_by_id(id)

        # Update only provided fields
        if title is not None:
            task.title = title
        if description is not None:
            task.description = description
        if status is not None:
            task.status = status
        if priority is not None:
            task.priority = priority
        if category is not None:
            task.category = category

        await save_task(task)

        return json.dumps({"success": True, "task": task_to_dict(task)}, indent=2)
    except Task.DoesNotExist:
        return json.dumps({"error": f"Task with id {id} not found"})
    except Exception as e:
        return json.dumps({"error": str(e)})


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

        return json.dumps({"success": True, "deleted": task_data}, indent=2)
    except Task.DoesNotExist:
        return json.dumps({"error": f"Task with id {id} not found"})
    except Exception as e:
        return json.dumps({"error": str(e)})


if __name__ == "__main__":
    import argparse

    # Parse command line arguments
    parser = argparse.ArgumentParser(description="Kanban MCP Server")
    parser.add_argument(
        "--http", action="store_true", help="Run with HTTP transport (default: stdio)"
    )
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.environ.get("PORT", 8000)),
        help="HTTP server port (default: 8000)",
    )
    parser.add_argument(
        "--host",
        default=os.environ.get("HOST", "0.0.0.0"),
        help="HTTP server host (default: 0.0.0.0)",
    )

    args = parser.parse_args()

    if args.http:
        # Remote access via HTTP
        print("🚀 Starting Kanban MCP Server (HTTP)")
        print(f"📍 Endpoint: http://{args.host}:{args.port}/sse")
        print(f"💚 Health check: http://{args.host}:{args.port}/health")
        print("\n⚙️  Claude Desktop/Code config:")
        print(f'   {{"command": "http://{args.host}:{args.port}/sse"}}')

        mcp.run(transport="sse", host=args.host, port=args.port)
    else:
        # Local access via stdio (default)
        print("🚀 Starting Kanban MCP Server (stdio)", file=sys.stderr)
        print("📍 Transport: Standard Input/Output", file=sys.stderr)
        print("✅ Ready for Claude Desktop/Code", file=sys.stderr)

        mcp.run(transport="stdio")
