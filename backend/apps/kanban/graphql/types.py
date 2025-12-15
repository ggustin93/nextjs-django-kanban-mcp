"""
Ariadne Type Definitions
========================

Defines custom scalars and enum bindings for the Kanban GraphQL schema.
Maps Django model choices to GraphQL enum types.
"""

from ariadne import EnumType, ScalarType

from apps.kanban.models import Task

# --- DateTime Scalar ---
# Serializes Django DateTimeField to ISO 8601 format

datetime_scalar = ScalarType("DateTime")


@datetime_scalar.serializer
def serialize_datetime(value):
    """Convert datetime to ISO 8601 string for GraphQL response."""
    if value is None:
        return None
    return value.isoformat()


@datetime_scalar.value_parser
def parse_datetime_value(value):
    """Parse ISO 8601 string from GraphQL input."""
    from datetime import datetime

    if value is None:
        return None
    return datetime.fromisoformat(value)


# --- Enum Bindings ---
# Map GraphQL enums to Django TextChoices values

task_status_enum = EnumType(
    "TaskStatusEnum",
    {
        "TODO": Task.Status.TODO,
        "DOING": Task.Status.DOING,
        "WAITING": Task.Status.WAITING,
        "DONE": Task.Status.DONE,
    },
)

task_priority_enum = EnumType(
    "TaskPriorityEnum",
    {
        "P1": Task.Priority.P1,
        "P2": Task.Priority.P2,
        "P3": Task.Priority.P3,
        "P4": Task.Priority.P4,
    },
)

# Export all type bindables for schema composition
type_bindables = [datetime_scalar, task_status_enum, task_priority_enum]
