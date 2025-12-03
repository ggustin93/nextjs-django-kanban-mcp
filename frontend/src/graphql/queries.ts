/**
 * GraphQL Queries - READ operations
 */
import { gql } from '@apollo/client';

export const GET_TASKS = gql`
  query GetTasks {
    allTasks {
      id
      title
      description
      status
      priority
      category
      createdAt
      updatedAt
    }
  }
`;
