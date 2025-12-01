"""Export GraphQL schema to schema.graphql file."""
import os
import sys

import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Import after Django setup (required for Django apps)
from graphql import print_schema  # noqa: E402

from config.schema import schema  # noqa: E402

# Output path: argument or default to root
output_path = sys.argv[1] if len(sys.argv) > 1 else 'schema.graphql'

# Export schema
schema_str = print_schema(schema.graphql_schema)

# Create directory if needed
os.makedirs(os.path.dirname(output_path) or '.', exist_ok=True)

# Write to file
with open(output_path, 'w') as f:
    f.write(schema_str)

print(f'✓ Schema exported to {output_path}')
