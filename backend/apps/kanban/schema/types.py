"""
Kanban GraphQL Type Definitions
================================

Purpose:
    Defines GraphQL types for the kanban app by mapping Django models
    to GraphQL schema types using Graphene Django.

TaskType:
    Represents a Task in GraphQL with fields:
    - id, title, description, status, category, priority
    - createdAt, updatedAt (timestamps)

TaskStatusEnum:
    GraphQL enum type for task status validation.
    Ensures only valid status values (TODO, DOING, DONE) are accepted.

TaskPriorityEnum:
    GraphQL enum type for task priority (Eisenhower-inspired).
    P1=Do First, P2=Schedule, P3=Quick Win, P4=Backlog

Usage:
    Used in queries and mutations as return types and field definitions.
"""

import graphene
from graphene_django import DjangoObjectType

from apps.kanban.models import Checklist, ChecklistItem, Task


class TaskStatusEnum(graphene.Enum):
    """GraphQL enum for Task.Status choices with validation."""

    TODO = "TODO"
    DOING = "DOING"
    WAITING = "WAITING"
    DONE = "DONE"


class TaskPriorityEnum(graphene.Enum):
    """GraphQL enum for Task.Priority choices."""

    P1 = "P1"
    P2 = "P2"
    P3 = "P3"
    P4 = "P4"


class ChecklistItemType(DjangoObjectType):
    """
    GraphQL Type for ChecklistItem
    ===============================

    Fields:
        - id, text, completed, position
        - checklist: Parent checklist reference
        - createdAt, updatedAt

    Performance:
        - Uses select_related for checklist to avoid N+1 queries
    """

    class Meta:
        model = ChecklistItem
        fields = "__all__"

    @classmethod
    def get_queryset(cls, queryset, info):
        """Optimize queries with select_related for parent checklist."""
        return queryset.select_related("checklist")


class ChecklistType(DjangoObjectType):
    """
    GraphQL Type for Checklist
    ===========================

    Fields:
        - id, title, task
        - items: Related ChecklistItems (ordered by position)
        - progress: Calculated completion percentage (0-100)
        - createdAt, updatedAt

    Performance:
        - Uses prefetch_related for items to avoid N+1 queries
        - Progress field is computed from database counts
    """

    progress = graphene.Int()

    class Meta:
        model = Checklist
        fields = "__all__"

    @classmethod
    def get_queryset(cls, queryset, info):
        """Optimize queries with prefetch_related for items."""
        return queryset.select_related("task").prefetch_related("items")

    def resolve_progress(self, info):
        """Calculate completion progress percentage."""
        return self.progress


class TaskType(DjangoObjectType):
    """
    GraphQL Type for Task
    =====================

    Extended to include checklists relationship.

    Performance:
        - Uses prefetch_related for checklists and their items
        - Prevents N+1 queries when loading task with checklists
    """

    class Meta:
        model = Task
        fields = "__all__"

    @classmethod
    def get_queryset(cls, queryset, info):
        """Optimize queries with prefetch for checklists and items."""
        return queryset.prefetch_related("checklists", "checklists__items")
