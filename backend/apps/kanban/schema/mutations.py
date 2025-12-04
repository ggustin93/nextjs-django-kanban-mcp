"""
Kanban GraphQL Mutations
========================

Purpose:
    Defines GraphQL mutation resolvers for write operations on tasks.

Available Mutations:
    - createTask: Creates a new task with title, status, category, priority
    - updateTask: Updates existing task fields with validation
    - deleteTask: Deletes a task by ID

Usage:
    mutation {
        createTask(title: "New Task", status: TODO, category: "#work", priority: P1) {
            task {
                id
                title
                status
                category
                priority
            }
        }
    }

Note:
    Status uses TaskStatusEnum, Priority uses TaskPriorityEnum for validation.
    Category auto-adds '#' prefix if missing.
"""

import graphene

from apps.kanban.models import Task

from .types import TaskPriorityEnum, TaskStatusEnum, TaskType


class CreateTask(graphene.Mutation):
    class Arguments:
        title = graphene.String(required=True)
        status = TaskStatusEnum()
        category = graphene.String()
        priority = TaskPriorityEnum()

    task = graphene.Field(TaskType)

    def mutate(self, info, title, status=None, category=None, priority=None):
        # Convert GraphQL enums to Django model choice values
        status_value = status.value if status else Task.Status.TODO
        priority_value = priority.value if priority else Task.Priority.P4

        # Auto-add # prefix to category if missing
        category_value = ""
        if category:
            category_value = category if category.startswith("#") else f"#{category}"

        task = Task.objects.create(
            title=title,
            status=status_value,
            category=category_value,
            priority=priority_value,
        )
        return CreateTask(task=task)


class UpdateTask(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        title = graphene.String()
        description = graphene.String()
        status = TaskStatusEnum()
        category = graphene.String()
        priority = TaskPriorityEnum()

    task = graphene.Field(TaskType)

    def mutate(
        self, info, id, title=None, description=None, status=None, category=None, priority=None
    ):
        task = Task.objects.get(pk=id)

        if title is not None:
            task.title = title
        if description is not None:
            task.description = description
        if status is not None:
            task.status = status.value if hasattr(status, "value") else status
        if category is not None:
            # Auto-add # prefix if missing, allow empty string to clear
            task.category = category if not category or category.startswith("#") else f"#{category}"
        if priority is not None:
            task.priority = priority.value if hasattr(priority, "value") else priority

        task.save()
        return UpdateTask(task=task)


class DeleteTask(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    def mutate(self, info, id):
        task = Task.objects.get(pk=id)
        task.delete()
        return DeleteTask(success=True)


class Mutation(graphene.ObjectType):
    create_task = CreateTask.Field()
    update_task = UpdateTask.Field()
    delete_task = DeleteTask.Field()
