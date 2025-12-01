"""
GraphQL Schema Configuration
============================

Purpose:
    Root GraphQL schema combining Query and Mutation classes from all apps.
    Served at /graphql endpoint via GRAPHENE['SCHEMA'] setting.

Architecture:
    Uses multiple inheritance to compose schema components:
    - Query: All read operations (allTasks)
    - Mutation: All write operations (createTask)

Example Usage:
    query { allTasks { id title status createdAt } }
    mutation { createTask(title: "Task", status: "TODO") { task { id } } }

Related Files:
    - config/settings.py: GRAPHENE configuration
    - kanban/schema/: Query/Mutation implementations

Security:
    - Implement authentication/authorization in resolvers
    - Validate all mutation inputs
    - Configure rate limiting at middleware level

Last Updated: 2025-12-01
"""
import graphene

import kanban.schema


class Query(kanban.schema.Query, graphene.ObjectType):
    """
    Root Query for GraphQL API - combines all read operations.

    Inherits: kanban.schema.Query (allTasks)
    Returns: All tasks ordered by creation date (newest first)

    Future: Add new app Query classes to inheritance list
    """


class Mutation(kanban.schema.Mutation, graphene.ObjectType):
    """
    Root Mutation for GraphQL API - combines all write operations.

    Inherits: kanban.schema.Mutation (createTask)

    Security: All mutations must validate inputs and check permissions
    Future: Add new app Mutation classes to inheritance list
    """


# Main schema instance referenced by config/settings.py
schema = graphene.Schema(
    query=Query,
    mutation=Mutation,
    auto_camelcase=True,  # snake_case → camelCase
)
