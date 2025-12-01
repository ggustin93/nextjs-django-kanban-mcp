/**
 * Kanban domain types and constants
 */

export enum TaskStatus {
  TODO = 'TODO',
  DOING = 'DOING',
  DONE = 'DONE',
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
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
  { title: 'Done', status: TaskStatus.DONE, color: '#4caf50', bgColor: '#e8f5e9' },
];

export interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
}
