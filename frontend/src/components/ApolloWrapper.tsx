/**
 * ApolloWrapper - GraphQL Provider for Next.js App Router (2025 Pattern)
 *
 * Uses ApolloNextAppProvider from @apollo/client-integration-nextjs
 * for proper SSR support and per-request client instances.
 */
'use client';

import { ApolloNextAppProvider } from '@apollo/client-integration-nextjs';
import { makeClient } from '@/graphql/client';

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  return <ApolloNextAppProvider makeClient={makeClient}>{children}</ApolloNextAppProvider>;
}
