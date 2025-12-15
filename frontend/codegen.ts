import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  // Source of truth: Ariadne SDL schema from backend
  schema: '../backend/apps/kanban/graphql/schema.graphql',

  // Scan for GraphQL operations in source files
  documents: 'src/**/*.{ts,tsx}',

  generates: {
    // Generate all types and hooks in a single file
    './src/graphql/generated.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        // Apollo Client 3.x compatibility
        reactApolloVersion: 3,

        // Generate React hooks (useQuery, useMutation)
        withHooks: true,

        // Use DocumentNode for operations
        documentMode: 'documentNode',

        // Enum handling - match backend enum values
        enumsAsTypes: false,

        // Scalar mappings for custom types
        scalars: {
          DateTime: 'string',
        },

        // Avoid naming conflicts
        dedupeOperationSuffix: true,

        // Add operation result types - using 'Data' suffix to avoid conflicts
        operationResultSuffix: 'Data',

        // Skip __typename for cleaner types
        skipTypename: false,

        // Use maybeValue for nullable fields
        maybeValue: 'T | null',
      },
    },
  },

  // Note: Run `npm run lint -- --fix` manually if needed for formatting
};

export default config;
