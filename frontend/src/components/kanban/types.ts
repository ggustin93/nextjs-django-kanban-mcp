/**
 * Kanban domain types and constants
 */

export enum TaskStatus {
  TODO = 'TODO',
  DOING = 'DOING',
  WAITING = 'WAITING',
  DONE = 'DONE',
}

export enum TaskPriority {
  P1 = 'P1',
  P2 = 'P2',
  P3 = 'P3',
  P4 = 'P4',
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  createdAt: string;
}

export interface Column {
  title: string;
  status: TaskStatus;
  color: string;
  bgColor: string;
}

export const COLUMNS: Column[] = [
  { title: 'To Do', status: TaskStatus.TODO, color: '#2196f3', bgColor: '#e3f2fd' },
  { title: 'Doing', status: TaskStatus.DOING, color: '#ff9800', bgColor: '#fff3e0' },
  { title: 'Waiting', status: TaskStatus.WAITING, color: '#9c27b0', bgColor: '#f3e5f5' },
  { title: 'Done', status: TaskStatus.DONE, color: '#4caf50', bgColor: '#e8f5e9' },
];

// Centralized priority configuration (DRY)
export const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; color: 'error' | 'warning' | 'info' | 'default'; shortLabel: string }
> = {
  [TaskPriority.P1]: { label: 'P1 - Do First', color: 'error', shortLabel: 'P1' },
  [TaskPriority.P2]: { label: 'P2 - Schedule', color: 'warning', shortLabel: 'P2' },
  [TaskPriority.P3]: { label: 'P3 - Quick Win', color: 'info', shortLabel: 'P3' },
  [TaskPriority.P4]: { label: 'P4 - Backlog', color: 'default', shortLabel: 'P4' },
};

// Priority sort order (P1 first)
export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  [TaskPriority.P1]: 1,
  [TaskPriority.P2]: 2,
  [TaskPriority.P3]: 3,
  [TaskPriority.P4]: 4,
};

export interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
}
