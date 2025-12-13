/**
 * Apollo Client Configuration (2025 Official Pattern)
 *
 * Uses @apollo/client-integration-nextjs for Next.js App Router support.
 * Provides SSR-safe client factory and error handling.
 */
import { HttpLink, from, CombinedGraphQLErrors } from '@apollo/client';
import { ErrorLink } from '@apollo/client/link/error';
import { ApolloClient, InMemoryCache, SSRMultipartLink } from '@apollo/client-integration-nextjs';

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8000/graphql/';

// Error handling link (Apollo 4.0 pattern)
const errorLink = new ErrorLink(({ error, operation }) => {
  if (CombinedGraphQLErrors.is(error)) {
    error.errors.forEach(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(
          locations
        )}, Path: ${path}`
      )
    );
  } else if (error) {
    console.error(`[Network error]:`, error);
    console.error(`[Failed Operation]:`, operation.operationName);
  }
});

// HTTP link
const httpLink = new HttpLink({
  uri: GRAPHQL_URL,
  credentials: 'include',
});

/**
 * Factory function for creating Apollo Client instances.
 * Required by ApolloNextAppProvider for SSR-safe client creation.
 */
export function makeClient() {
  return new ApolloClient({
    cache: new InMemoryCache({
      typePolicies: {
        Task: {
          keyFields: ['id'],
        },
        Query: {
          fields: {
            allTasks: {
              merge(_, incoming) {
                return incoming;
              },
            },
          },
        },
      },
    }),
    link:
      typeof window === 'undefined'
        ? from([new SSRMultipartLink({ stripDefer: true }), errorLink, httpLink])
        : from([errorLink, httpLink]),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
    },
  });
}
