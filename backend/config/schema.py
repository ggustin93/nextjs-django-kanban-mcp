"""
Ariadne GraphQL Schema Configuration
====================================

Schema-first GraphQL API using Ariadne framework.
SDL files in apps/*/graphql/ define the schema structure.

Example Usage:
    query { allTasks { id title status createdAt } }
    mutation { createTask(title: "Task", status: "TODO") { task { id } } }
"""

from ariadne import make_executable_schema, snake_case_fallback_resolvers

import apps.kanban.graphql as kanban

# Build executable schema from SDL and resolvers
schema = make_executable_schema(
    kanban.type_defs,
    kanban.query,
    kanban.mutation,
    *kanban.type_bindables,
    snake_case_fallback_resolvers,  # Converts snake_case fields to camelCase
)
