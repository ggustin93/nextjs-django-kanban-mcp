"""
Kanban GraphQL Package
======================

Exports all schema components for Ariadne schema composition.
Import this package in config/schema.py to build the executable schema.
"""

from pathlib import Path

from ariadne import load_schema_from_path

from .mutations import mutation
from .queries import query
from .types import type_bindables

# Load SDL schema from file
_schema_path = Path(__file__).parent / "schema.graphql"
type_defs = load_schema_from_path(str(_schema_path))

# Export all components for schema composition
__all__ = ["type_defs", "query", "mutation", "type_bindables"]
