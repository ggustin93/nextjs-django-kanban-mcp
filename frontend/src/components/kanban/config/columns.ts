/**
 * Kanban column configuration
 */

import { TaskStatusEnum } from '@/graphql/generated';

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
