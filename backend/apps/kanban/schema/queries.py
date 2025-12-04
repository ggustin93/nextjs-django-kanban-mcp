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
"""

import graphene

from apps.kanban.models import Task

from .types import TaskType


class Query(graphene.ObjectType):
    all_tasks = graphene.List(TaskType)

    def resolve_all_tasks(self, info):
        return Task.objects.all().order_by("-created_at")
