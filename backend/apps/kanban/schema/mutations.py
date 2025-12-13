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

from django.core.exceptions import ObjectDoesNotExist
from django.db import models, transaction

import graphene

from apps.kanban.models import Checklist, ChecklistItem, Task

from .types import ChecklistItemType, ChecklistType, TaskPriorityEnum, TaskStatusEnum, TaskType


class CreateTask(graphene.Mutation):
    """Create a new task with validation."""

    class Arguments:
        title = graphene.String(required=True)
        status = TaskStatusEnum()
        category = graphene.String()
        priority = TaskPriorityEnum()
        order = graphene.Int()

    task = graphene.Field(TaskType)
    errors = graphene.List(graphene.String)

    def mutate(self, info, title, status=None, category=None, priority=None, order=None):
        # Validate title
        if not title or not title.strip():
            return CreateTask(task=None, errors=["Title cannot be empty"])

        # Convert GraphQL enums to Django model choice values
        status_value = status.value if status else Task.Status.TODO
        priority_value = priority.value if priority else Task.Priority.P4

        # Auto-add # prefix to category if missing
        category_value = ""
        if category:
            category_value = category if category.startswith("#") else f"#{category}"

        # Get max order for this status/priority if not provided
        order_value = order
        if order_value is None:
            max_order = Task.objects.filter(status=status_value, priority=priority_value).aggregate(
                models.Max("order")
            )["order__max"]
            order_value = (max_order or 0) + 1

        task = Task.objects.create(
            title=title.strip(),
            status=status_value,
            category=category_value,
            priority=priority_value,
            order=order_value,
        )
        return CreateTask(task=task, errors=[])


class UpdateTask(graphene.Mutation):
    """Update an existing task with validation."""

    class Arguments:
        id = graphene.ID(required=True)
        title = graphene.String()
        description = graphene.String()
        status = TaskStatusEnum()
        category = graphene.String()
        priority = TaskPriorityEnum()
        order = graphene.Int()

    task = graphene.Field(TaskType)
    errors = graphene.List(graphene.String)

    def mutate(
        self,
        info,
        id,
        title=None,
        description=None,
        status=None,
        category=None,
        priority=None,
        order=None,
    ):
        try:
            task = Task.objects.get(pk=id)
        except ObjectDoesNotExist:
            return UpdateTask(task=None, errors=[f"Task {id} not found"])

        # Validate title if provided
        if title is not None:
            if not title.strip():
                return UpdateTask(task=None, errors=["Title cannot be empty"])
            task.title = title.strip()
        if description is not None:
            task.description = description
        if status is not None:
            task.status = status.value if hasattr(status, "value") else status
        if category is not None:
            # Auto-add # prefix if missing, allow empty string to clear
            task.category = category if not category or category.startswith("#") else f"#{category}"
        if priority is not None:
            task.priority = priority.value if hasattr(priority, "value") else priority
        if order is not None:
            task.order = order

        task.save()
        return UpdateTask(task=task, errors=[])


class DeleteTask(graphene.Mutation):
    """Delete a task by ID."""

    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()
    deleted_id = graphene.ID()
    errors = graphene.List(graphene.String)

    def mutate(self, info, id):
        try:
            task = Task.objects.get(pk=id)
        except ObjectDoesNotExist:
            return DeleteTask(success=False, deleted_id=None, errors=[f"Task {id} not found"])

        task.delete()
        return DeleteTask(success=True, deleted_id=id, errors=[])


class CreateChecklist(graphene.Mutation):
    """Create a new checklist for a task."""

    class Arguments:
        task_id = graphene.ID(required=True)
        title = graphene.String(required=True)

    checklist = graphene.Field(ChecklistType)
    errors = graphene.List(graphene.String)

    def mutate(self, info, task_id, title):
        try:
            task = Task.objects.get(pk=task_id)
        except ObjectDoesNotExist:
            return CreateChecklist(checklist=None, errors=[f"Task {task_id} not found"])

        checklist = Checklist.objects.create(task=task, title=title)
        return CreateChecklist(checklist=checklist, errors=[])


class DeleteChecklist(graphene.Mutation):
    """Delete a checklist and all its items (CASCADE)."""

    class Arguments:
        checklist_id = graphene.ID(required=True)

    success = graphene.Boolean()
    deleted_id = graphene.ID()
    errors = graphene.List(graphene.String)

    def mutate(self, info, checklist_id):
        try:
            checklist = Checklist.objects.get(pk=checklist_id)
        except ObjectDoesNotExist:
            return DeleteChecklist(
                success=False, deleted_id=None, errors=[f"Checklist {checklist_id} not found"]
            )

        checklist.delete()
        return DeleteChecklist(success=True, deleted_id=checklist_id, errors=[])


class AddChecklistItem(graphene.Mutation):
    """Add a new item to a checklist. Auto-calculates position if not provided."""

    class Arguments:
        checklist_id = graphene.ID(required=True)
        text = graphene.String(required=True)
        position = graphene.Int()

    item = graphene.Field(ChecklistItemType)
    errors = graphene.List(graphene.String)

    def mutate(self, info, checklist_id, text, position=None):
        try:
            checklist = Checklist.objects.get(pk=checklist_id)
        except ObjectDoesNotExist:
            return AddChecklistItem(item=None, errors=[f"Checklist {checklist_id} not found"])

        # Validation
        if not text or not text.strip():
            return AddChecklistItem(item=None, errors=["Item text cannot be empty"])

        # Auto-calculate position if not provided
        if position is None:
            max_position = checklist.items.aggregate(models.Max("position"))["position__max"]
            position = (max_position or -1) + 1

        item = ChecklistItem.objects.create(
            checklist=checklist, text=text.strip(), position=position, completed=False
        )
        return AddChecklistItem(item=item, errors=[])


class ToggleChecklistItem(graphene.Mutation):
    """Toggle the completed state of a checklist item."""

    class Arguments:
        item_id = graphene.ID(required=True)

    item = graphene.Field(ChecklistItemType)
    errors = graphene.List(graphene.String)

    def mutate(self, info, item_id):
        try:
            item = ChecklistItem.objects.get(pk=item_id)
        except ObjectDoesNotExist:
            return ToggleChecklistItem(item=None, errors=[f"Item {item_id} not found"])

        item.completed = not item.completed
        item.save(update_fields=["completed", "updated_at"])
        return ToggleChecklistItem(item=item, errors=[])


class UpdateChecklistItem(graphene.Mutation):
    """Update text and/or completed state of a checklist item."""

    class Arguments:
        item_id = graphene.ID(required=True)
        text = graphene.String()
        completed = graphene.Boolean()

    item = graphene.Field(ChecklistItemType)
    errors = graphene.List(graphene.String)

    def mutate(self, info, item_id, text=None, completed=None):
        try:
            item = ChecklistItem.objects.get(pk=item_id)
        except ObjectDoesNotExist:
            return UpdateChecklistItem(item=None, errors=[f"Item {item_id} not found"])

        updated_fields = ["updated_at"]

        if text is not None:
            item.text = text.strip()
            updated_fields.append("text")

        if completed is not None:
            item.completed = completed
            updated_fields.append("completed")

        item.save(update_fields=updated_fields)
        return UpdateChecklistItem(item=item, errors=[])


class DeleteChecklistItem(graphene.Mutation):
    """Delete a checklist item."""

    class Arguments:
        item_id = graphene.ID(required=True)

    success = graphene.Boolean()
    deleted_id = graphene.ID()
    errors = graphene.List(graphene.String)

    def mutate(self, info, item_id):
        try:
            item = ChecklistItem.objects.get(pk=item_id)
        except ObjectDoesNotExist:
            return DeleteChecklistItem(
                success=False, deleted_id=None, errors=[f"Item {item_id} not found"]
            )

        item.delete()
        return DeleteChecklistItem(success=True, deleted_id=item_id, errors=[])


class ReorderChecklistItems(graphene.Mutation):
    """Reorder all items in a checklist atomically using bulk_update."""

    class Arguments:
        checklist_id = graphene.ID(required=True)
        item_ids = graphene.List(graphene.ID, required=True)

    items = graphene.List(ChecklistItemType)
    checklist = graphene.Field(ChecklistType)
    errors = graphene.List(graphene.String)

    @staticmethod
    @transaction.atomic
    def mutate(root, info, checklist_id, item_ids):
        try:
            checklist = Checklist.objects.get(pk=checklist_id)
        except ObjectDoesNotExist:
            return ReorderChecklistItems(
                items=None, checklist=None, errors=[f"Checklist {checklist_id} not found"]
            )

        # Validate all items belong to this checklist
        items = list(ChecklistItem.objects.filter(id__in=item_ids, checklist=checklist))

        if len(items) != len(item_ids):
            return ReorderChecklistItems(
                items=None,
                checklist=None,
                errors=["All items must belong to the specified checklist"],
            )

        # Create mapping and prepare for bulk update
        id_to_position = {str(item_id): idx for idx, item_id in enumerate(item_ids)}
        items_to_update = []

        for item in items:
            new_position = id_to_position[str(item.id)]
            if item.position != new_position:
                item.position = new_position
                items_to_update.append(item)

        # True bulk update - single query instead of N queries
        if items_to_update:
            ChecklistItem.objects.bulk_update(items_to_update, ["position"])

        # Return updated items in correct order
        updated_items = ChecklistItem.objects.filter(checklist=checklist).order_by("position")

        return ReorderChecklistItems(items=list(updated_items), checklist=checklist, errors=[])


class Mutation(graphene.ObjectType):
    # Task mutations
    create_task = CreateTask.Field()
    update_task = UpdateTask.Field()
    delete_task = DeleteTask.Field()

    # Checklist mutations
    create_checklist = CreateChecklist.Field()
    delete_checklist = DeleteChecklist.Field()

    # Checklist item mutations
    add_checklist_item = AddChecklistItem.Field()
    toggle_checklist_item = ToggleChecklistItem.Field()
    update_checklist_item = UpdateChecklistItem.Field()
    delete_checklist_item = DeleteChecklistItem.Field()
    reorder_checklist_items = ReorderChecklistItems.Field()
