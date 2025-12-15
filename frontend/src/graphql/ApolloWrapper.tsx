/**
 * Apollo Wrapper - Client component for App Router
 * Uses useMemo to create client only on client-side
 */
'use client';

import { useMemo } from 'react';
import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client/core';
import { ApolloProvider } from '@apollo/client/react';
import { onError } from '@apollo/client/link/error';

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8000/graphql/';

function makeClient() {
  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        console.error(
          `[GraphQL Error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        );
      });
    }
    if (networkError) {
      console.error(`[Network Error]:`, networkError);
    }
  });

  const httpLink = new HttpLink({
    uri: GRAPHQL_URL,
    credentials: 'include',
  });

  return new ApolloClient({
    link: from([errorLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Task: {
          keyFields: ['id'],
        },
        Query: {
          fields: {
            allTasks: {
              merge(_existing, incoming) {
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
}

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => makeClient(), []);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
