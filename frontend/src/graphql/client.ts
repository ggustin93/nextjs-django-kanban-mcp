/**
 * Apollo Client Configuration
 * ==========================
 *
 * Purpose: GraphQL client for Django backend communication
 * Features: Error handling, caching, automatic cache updates
 */
import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8000/graphql/';

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(`[GraphQL Error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
    });
  }

  if (networkError) {
    console.error(`[Network Error]:`, networkError);
  }
});

// HTTP link
const httpLink = new HttpLink({
  uri: GRAPHQL_URL,
  credentials: 'include',
});

// Apollo Client instance
export const apolloClient = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Task: {
        keyFields: ['id'],
      },
      Query: {
        fields: {
          allTasks: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            merge(_existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
