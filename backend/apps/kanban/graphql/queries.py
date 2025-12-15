"""
GraphQL Query Resolvers
"""

from ariadne import QueryType

from apps.kanban.models import Task

query = QueryType()


@query.field("allTasks")
def resolve_all_tasks(_, info):
    """Return all tasks ordered by priority and creation date."""
    return Task.objects.all().order_by("priority", "-created_at")
