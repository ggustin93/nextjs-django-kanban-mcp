/**
 * GraphQL Mutations - WRITE operations
 */
import { gql } from '@apollo/client';

export const CREATE_TASK = gql`
  mutation CreateTask($title: String!, $status: TaskStatusEnum) {
    createTask(title: $title, status: $status) {
      task {
        id
        title
        description
        status
        createdAt
      }
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $title: String, $description: String, $status: TaskStatusEnum) {
    updateTask(id: $id, title: $title, description: $description, status: $status) {
      task {
        id
        title
        description
        status
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
