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
      order
      createdAt
      updatedAt
      checklists {
        id
        title
        progress
        items {
          id
          text
          completed
          position
        }
      }
    }
  }
`;
