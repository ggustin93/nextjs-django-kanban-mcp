/**
 * Kanban domain types
 *
 * Re-exports GraphQL generated enums for convenience.
 * Use TaskType directly from @/graphql/generated for task data.
 * UI configs moved to ./config/ directory.
 */

// Re-export enums and types from GraphQL Codegen
export {
  TaskStatusEnum,
  TaskPriorityEnum,
  type TaskType,
  type CreateTaskPayload,
  type UpdateTaskPayload,
  type DeleteTaskPayload,
  type TaskError,
} from '@/graphql/generated';

import { TaskStatusEnum, TaskPriorityEnum } from '@/graphql/generated';

// Form data type for task creation/editing
export interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatusEnum;
  priority: TaskPriorityEnum;
  category: string;
}

// View type for board display mode
export type ViewType = 'kanban' | 'eisenhower';

// Filter state for task filtering
export interface FilterState {
  priorities: TaskPriorityEnum[];
  categories: string[];
  statuses: TaskStatusEnum[];
  searchText: string;
}
