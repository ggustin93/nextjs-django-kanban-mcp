/**
 * GraphQL Mutations - WRITE operations
 */
import { gql } from '@apollo/client';

export const CREATE_TASK = gql`
  mutation CreateTask(
    $title: String!
    $status: TaskStatusEnum
    $category: String
    $priority: TaskPriorityEnum
  ) {
    createTask(title: $title, status: $status, category: $category, priority: $priority) {
      task {
        id
        title
        description
        status
        priority
        category
        createdAt
      }
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask(
    $id: ID!
    $title: String
    $description: String
    $status: TaskStatusEnum
    $category: String
    $priority: TaskPriorityEnum
  ) {
    updateTask(
      id: $id
      title: $title
      description: $description
      status: $status
      category: $category
      priority: $priority
    ) {
      task {
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
  }
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id) {
      success
    }
  }
`;
