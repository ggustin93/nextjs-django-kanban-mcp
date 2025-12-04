"""
Kanban GraphQL Schema Package
==============================

Purpose:
    Exports Query and Mutation classes for the kanban app's GraphQL operations.
    Organizes schema components into separate modules for better maintainability.

Structure:
    - queries.py: Read operations (fetching tasks)
    - mutations.py: Write operations (creating, updating tasks)
    - types.py: GraphQL type definitions (TaskType)

Usage:
    Imported by root schema in config/schema.py to compose the complete API.
"""

from .mutations import Mutation
from .queries import Query

__all__ = ["Query", "Mutation"]
