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
    $order: Int
  ) {
    createTask(
      title: $title
      status: $status
      category: $category
      priority: $priority
      order: $order
    ) {
      task {
        id
        title
        description
        status
        priority
        category
        order
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
    $order: Int
  ) {
    updateTask(
      id: $id
      title: $title
      description: $description
      status: $status
      category: $category
      priority: $priority
      order: $order
    ) {
      task {
        id
        title
        description
        status
        priority
        category
        order
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

// ============================================
// Checklist Mutations
// ============================================

export const CREATE_CHECKLIST = gql`
  mutation CreateChecklist($taskId: ID!, $title: String!) {
    createChecklist(taskId: $taskId, title: $title) {
      checklist {
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

export const DELETE_CHECKLIST = gql`
  mutation DeleteChecklist($checklistId: ID!) {
    deleteChecklist(checklistId: $checklistId) {
      success
      deletedId
    }
  }
`;

export const ADD_CHECKLIST_ITEM = gql`
  mutation AddChecklistItem($checklistId: ID!, $text: String!, $position: Int) {
    addChecklistItem(checklistId: $checklistId, text: $text, position: $position) {
      item {
        id
        text
        completed
        position
      }
    }
  }
`;

export const TOGGLE_CHECKLIST_ITEM = gql`
  mutation ToggleChecklistItem($itemId: ID!) {
    toggleChecklistItem(itemId: $itemId) {
      item {
        id
        completed
      }
    }
  }
`;

export const UPDATE_CHECKLIST_ITEM = gql`
  mutation UpdateChecklistItem($itemId: ID!, $text: String, $completed: Boolean) {
    updateChecklistItem(itemId: $itemId, text: $text, completed: $completed) {
      item {
        id
        text
        completed
      }
    }
  }
`;

export const DELETE_CHECKLIST_ITEM = gql`
  mutation DeleteChecklistItem($itemId: ID!) {
    deleteChecklistItem(itemId: $itemId) {
      success
      deletedId
    }
  }
`;
