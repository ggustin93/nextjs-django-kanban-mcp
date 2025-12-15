"""
Kanban GraphQL Queries
======================

Purpose:
    Defines GraphQL query resolvers for read-only operations on tasks.

Available Queries:
    - allTasks: Returns all tasks ordered by creation date (newest first)

Usage:
    query {
        allTasks {
            id
            title
            status
            createdAt
        }
    }

Note:
    Uses TaskType.get_queryset() for N+1 query prevention via prefetch_related.
"""

import graphene

from apps.kanban.models import Task

from .types import TaskType


class Query(graphene.ObjectType):
    all_tasks = graphene.List(TaskType)

    def resolve_all_tasks(self, info):
        # Use TaskType.get_queryset for optimized prefetching (N+1 prevention)
        return TaskType.get_queryset(Task.objects.all(), info).order_by("-created_at")
