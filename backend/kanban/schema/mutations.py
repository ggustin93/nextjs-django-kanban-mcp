"""
Kanban GraphQL Mutations
========================

Purpose:
    Defines GraphQL mutation resolvers for write operations on tasks.

Available Mutations:
    - createTask: Creates a new task with title and optional status (validated enum)
    - updateTask: Updates existing task fields with validation
    - deleteTask: Deletes a task by ID

Usage:
    mutation {
        createTask(title: "New Task", status: TODO) {
            task {
                id
                title
                status
            }
        }
    }

Note:
    Status field uses TaskStatusEnum for input validation, preventing invalid values.
"""
import graphene

from kanban.models import Task

from .types import TaskStatusEnum, TaskType


class CreateTask(graphene.Mutation):
    class Arguments:
        title = graphene.String(required=True)
        status = TaskStatusEnum()

    task = graphene.Field(TaskType)

    def mutate(self, info, title, status=None):
        # Convert GraphQL enum to Django model choice value
        if status is not None:
            # Get the string value from the enum (e.g., "TODO", "DOING", "DONE")
            status_value = status.value if hasattr(status, 'value') else status
        else:
            status_value = Task.Status.TODO
        task = Task.objects.create(title=title, status=status_value)
        return CreateTask(task=task)


class UpdateTask(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        title = graphene.String()
        description = graphene.String()
        status = TaskStatusEnum()

    task = graphene.Field(TaskType)

    def mutate(self, info, id, title=None, description=None, status=None):
        task = Task.objects.get(pk=id)
        if title is not None:
            task.title = title
        if description is not None:
            task.description = description
        if status is not None:
            # Convert GraphQL enum to Django model choice value
            task.status = status.value if hasattr(status, 'value') else status
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
