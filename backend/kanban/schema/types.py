"""
Kanban GraphQL Type Definitions
================================

Purpose:
    Defines GraphQL types for the kanban app by mapping Django models
    to GraphQL schema types using Graphene Django.

TaskType:
    Represents a Task in GraphQL with fields:
    - id, title, description, status
    - createdAt, updatedAt (timestamps)

TaskStatusEnum:
    GraphQL enum type for task status validation.
    Ensures only valid status values (TODO, DOING, DONE) are accepted.

Usage:
    Used in queries and mutations as return types and field definitions.
"""
import graphene
from graphene_django import DjangoObjectType

from kanban.models import Task


class TaskStatusEnum(graphene.Enum):
    """GraphQL enum for Task.Status choices with validation."""

    TODO = 'TODO'
    DOING = 'DOING'
    DONE = 'DONE'


class TaskType(DjangoObjectType):
    class Meta:
        model = Task
        fields = '__all__'
