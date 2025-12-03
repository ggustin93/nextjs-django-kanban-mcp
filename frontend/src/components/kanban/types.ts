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
  { title: 'To Do', status: TaskStatus.TODO, color: '#3b82f6', bgColor: '#eff6ff' },
  { title: 'Doing', status: TaskStatus.DOING, color: '#f59e0b', bgColor: '#fffbeb' },
  { title: 'Waiting', status: TaskStatus.WAITING, color: '#8b5cf6', bgColor: '#f5f3ff' },
  { title: 'Done', status: TaskStatus.DONE, color: '#10b981', bgColor: '#f0fdf4' },
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

// Eisenhower Matrix configuration
export enum EisenhowerQuadrant {
  URGENT_IMPORTANT = 'URGENT_IMPORTANT', // P1 - Do First
  URGENT_NOT_IMPORTANT = 'URGENT_NOT_IMPORTANT', // P3 - Quick Win
  NOT_URGENT_IMPORTANT = 'NOT_URGENT_IMPORTANT', // P2 - Schedule
  NOT_URGENT_NOT_IMPORTANT = 'NOT_URGENT_NOT_IMPORTANT', // P4 - Backlog
}

export interface EisenhowerQuadrantConfig {
  title: string;
  subtitle: string;
  quadrant: EisenhowerQuadrant;
  priority: TaskPriority;
  color: string;
  bgColor: string;
}

export const EISENHOWER_QUADRANTS: EisenhowerQuadrantConfig[] = [
  {
    title: 'Do First',
    subtitle: 'Urgent & Important',
    quadrant: EisenhowerQuadrant.URGENT_IMPORTANT,
    priority: TaskPriority.P1,
    color: 'linear-gradient(135deg, #fca5a5 0%, #f87171 100%)', // Soft coral gradient
    bgColor: '#fef2f2',
  },
  {
    title: 'Schedule',
    subtitle: 'Not Urgent & Important',
    quadrant: EisenhowerQuadrant.NOT_URGENT_IMPORTANT,
    priority: TaskPriority.P2,
    color: 'linear-gradient(135deg, #fdba74 0%, #fb923c 100%)', // Soft amber gradient
    bgColor: '#fffbeb',
  },
  {
    title: 'Quick Win',
    subtitle: 'Urgent & Not Important',
    quadrant: EisenhowerQuadrant.URGENT_NOT_IMPORTANT,
    priority: TaskPriority.P3,
    color: 'linear-gradient(135deg, #7dd3fc 0%, #38bdf8 100%)', // Soft sky blue gradient
    bgColor: '#eff6ff',
  },
  {
    title: 'Backlog',
    subtitle: 'Not Urgent & Not Important',
    quadrant: EisenhowerQuadrant.NOT_URGENT_NOT_IMPORTANT,
    priority: TaskPriority.P4,
    color: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)', // Soft slate gradient
    bgColor: '#f8fafc',
  },
];

// View type
export type ViewType = 'kanban' | 'eisenhower';

// Filter state
export interface FilterState {
  priorities: TaskPriority[];
  categories: string[];
  statuses: TaskStatus[];
  searchText: string;
}
