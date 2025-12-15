/**
 * Kanban domain types and constants
 * Re-exports generated types from GraphQL Codegen
 */

// Export generated types directly - no aliases, no confusion
export {
  TaskStatusEnum,
  TaskPriorityEnum,
  type TaskType,
  type CreateTaskPayload,
  type UpdateTaskPayload,
  type DeleteTaskPayload,
  type TaskError,
} from '@/graphql/generated';

import { TaskStatusEnum, TaskPriorityEnum, type TaskType } from '@/graphql/generated';

// Column configuration
export interface Column {
  title: string;
  status: TaskStatusEnum;
  color: string;
  bgColor: string;
  chipColor: 'info' | 'warning' | 'secondary' | 'success';
}

export const COLUMNS: Column[] = [
  {
    title: 'To Do',
    status: TaskStatusEnum.Todo,
    color: '#3b82f6',
    bgColor: '#eff6ff',
    chipColor: 'info',
  },
  {
    title: 'Doing',
    status: TaskStatusEnum.Doing,
    color: '#f59e0b',
    bgColor: '#fffbeb',
    chipColor: 'warning',
  },
  {
    title: 'Waiting',
    status: TaskStatusEnum.Waiting,
    color: '#d946ef',
    bgColor: '#fdf4ff',
    chipColor: 'secondary',
  },
  {
    title: 'Done',
    status: TaskStatusEnum.Done,
    color: '#10b981',
    bgColor: '#f0fdf4',
    chipColor: 'success',
  },
];

// Priority configuration
export const PRIORITY_CONFIG: Record<
  TaskPriorityEnum,
  { label: string; color: 'error' | 'warning' | 'info' | 'default'; shortLabel: string }
> = {
  [TaskPriorityEnum.P1]: { label: 'P1 - Do First', color: 'error', shortLabel: 'P1' },
  [TaskPriorityEnum.P2]: { label: 'P2 - Schedule', color: 'warning', shortLabel: 'P2' },
  [TaskPriorityEnum.P3]: { label: 'P3 - Quick Win', color: 'info', shortLabel: 'P3' },
  [TaskPriorityEnum.P4]: { label: 'P4 - Backlog', color: 'default', shortLabel: 'P4' },
};

// Priority sort order (P1 first)
export const PRIORITY_ORDER: Record<TaskPriorityEnum, number> = {
  [TaskPriorityEnum.P1]: 1,
  [TaskPriorityEnum.P2]: 2,
  [TaskPriorityEnum.P3]: 3,
  [TaskPriorityEnum.P4]: 4,
};

// Priority colors for Eisenhower Matrix
export function getPriorityColor(priority: TaskPriorityEnum): string {
  const colorMap: Record<TaskPriorityEnum, string> = {
    [TaskPriorityEnum.P1]: '#dc2626',
    [TaskPriorityEnum.P2]: '#fb923c',
    [TaskPriorityEnum.P3]: '#0284c7',
    [TaskPriorityEnum.P4]: '#475569',
  };
  return colorMap[priority];
}

// Form data type
export interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatusEnum;
  priority: TaskPriorityEnum;
  category: string;
}

// Task type alias for convenience
export type Task = TaskType;

// Eisenhower Matrix configuration
export enum EisenhowerQuadrant {
  URGENT_IMPORTANT = 'URGENT_IMPORTANT',
  URGENT_NOT_IMPORTANT = 'URGENT_NOT_IMPORTANT',
  NOT_URGENT_IMPORTANT = 'NOT_URGENT_IMPORTANT',
  NOT_URGENT_NOT_IMPORTANT = 'NOT_URGENT_NOT_IMPORTANT',
}

export interface EisenhowerQuadrantConfig {
  title: string;
  subtitle: string;
  quadrant: EisenhowerQuadrant;
  priority: TaskPriorityEnum;
  color: string;
  bgColor: string;
}

export const EISENHOWER_QUADRANTS: EisenhowerQuadrantConfig[] = [
  {
    title: 'Do First',
    subtitle: 'Urgent & Important',
    quadrant: EisenhowerQuadrant.URGENT_IMPORTANT,
    priority: TaskPriorityEnum.P1,
    color: 'linear-gradient(135deg, #fca5a5 0%, #f87171 100%)',
    bgColor: '#fef2f2',
  },
  {
    title: 'Schedule',
    subtitle: 'Not Urgent & Important',
    quadrant: EisenhowerQuadrant.NOT_URGENT_IMPORTANT,
    priority: TaskPriorityEnum.P2,
    color: 'linear-gradient(135deg, #fdba74 0%, #fb923c 100%)',
    bgColor: '#fffbeb',
  },
  {
    title: 'Quick Win',
    subtitle: 'Urgent & Not Important',
    quadrant: EisenhowerQuadrant.URGENT_NOT_IMPORTANT,
    priority: TaskPriorityEnum.P3,
    color: 'linear-gradient(135deg, #7dd3fc 0%, #38bdf8 100%)',
    bgColor: '#eff6ff',
  },
  {
    title: 'Backlog',
    subtitle: 'Not Urgent & Not Important',
    quadrant: EisenhowerQuadrant.NOT_URGENT_NOT_IMPORTANT,
    priority: TaskPriorityEnum.P4,
    color: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
    bgColor: '#f8fafc',
  },
];

// View type
export type ViewType = 'kanban' | 'eisenhower';

// Filter state
export interface FilterState {
  priorities: TaskPriorityEnum[];
  categories: string[];
  statuses: TaskStatusEnum[];
  searchText: string;
}
