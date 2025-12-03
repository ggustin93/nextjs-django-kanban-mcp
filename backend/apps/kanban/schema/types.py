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

from apps.kanban.models import Task


class TaskStatusEnum(graphene.Enum):
    """GraphQL enum for Task.Status choices with validation."""

    TODO = 'TODO'
    DOING = 'DOING'
    WAITING = 'WAITING'
    DONE = 'DONE'


class TaskPriorityEnum(graphene.Enum):
    """GraphQL enum for Task.Priority choices."""

    P1 = 'P1'
    P2 = 'P2'
    P3 = 'P3'
    P4 = 'P4'


class TaskType(DjangoObjectType):
    class Meta:
        model = Task
        fields = '__all__'
