"""
GraphQL Mutation Resolvers
==========================

Provides create, update, and delete operations for tasks.
All mutations return structured payloads with error handling.
"""

from django.core.exceptions import ObjectDoesNotExist, ValidationError

from ariadne import MutationType

from apps.kanban.models import Task

mutation = MutationType()


@mutation.field("createTask")
def resolve_create_task(_, info, title, status=None, category=None, priority=None):
    """
    Create a new task with the given attributes.

    Args:
        title: Task title (required)
        status: Initial status (defaults to TODO)
        category: Optional category tag
        priority: Priority level (defaults to P4)

    Returns:
        CreateTaskPayload with task or errors
    """
    try:
        # Ensure category has # prefix if provided
        if category and not category.startswith("#"):
            category = f"#{category}"

        task = Task.objects.create(
            title=title,
            status=status or Task.Status.TODO,
            priority=priority or Task.Priority.P4,
            category=category or "",
        )
        return {"task": task, "errors": None}

    except ValidationError as e:
        errors = [{"field": k, "message": v[0]} for k, v in e.message_dict.items()]
        return {"task": None, "errors": errors}


@mutation.field("updateTask")
def resolve_update_task(
    _, info, id, title=None, description=None, status=None, category=None, priority=None
):
    """
    Update an existing task's attributes.

    Args:
        id: Task ID to update (required)
        title: New title (optional)
        description: New description (optional)
        status: New status (optional)
        category: New category (optional)
        priority: New priority (optional)

    Returns:
        UpdateTaskPayload with updated task or errors
    """
    try:
        task = Task.objects.get(pk=id)

        # Update only provided fields
        if title is not None:
            task.title = title
        if description is not None:
            task.description = description
        if status is not None:
            task.status = status
        if category is not None:
            if category and not category.startswith("#"):
                category = f"#{category}"
            task.category = category
        if priority is not None:
            task.priority = priority

        task.full_clean()
        task.save()
        return {"task": task, "errors": None}

    except ObjectDoesNotExist:
        return {"task": None, "errors": [{"field": "id", "message": f"Task {id} not found"}]}

    except ValidationError as e:
        errors = [{"field": k, "message": v[0]} for k, v in e.message_dict.items()]
        return {"task": None, "errors": errors}


@mutation.field("deleteTask")
def resolve_delete_task(_, info, id):
    """
    Delete a task by ID.

    Args:
        id: Task ID to delete (required)

    Returns:
        DeleteTaskPayload with success status or errors
    """
    try:
        task = Task.objects.get(pk=id)
        task.delete()
        return {"success": True, "errors": None}

    except ObjectDoesNotExist:
        return {"success": False, "errors": [{"field": "id", "message": f"Task {id} not found"}]}
