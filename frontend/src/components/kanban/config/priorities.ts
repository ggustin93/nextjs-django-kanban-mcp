/**
 * Priority configuration for tasks
 */

import { TaskPriorityEnum } from '@/graphql/generated';

export const PRIORITY_CONFIG: Record<
  TaskPriorityEnum,
  { label: string; color: 'error' | 'warning' | 'info' | 'default'; shortLabel: string }
> = {
  [TaskPriorityEnum.P1]: { label: 'P1 - Do First', color: 'error', shortLabel: 'P1' },
  [TaskPriorityEnum.P2]: { label: 'P2 - Schedule', color: 'warning', shortLabel: 'P2' },
  [TaskPriorityEnum.P3]: { label: 'P3 - Quick Win', color: 'info', shortLabel: 'P3' },
  [TaskPriorityEnum.P4]: { label: 'P4 - Backlog', color: 'default', shortLabel: 'P4' },
};

export const PRIORITY_ORDER: Record<TaskPriorityEnum, number> = {
  [TaskPriorityEnum.P1]: 1,
  [TaskPriorityEnum.P2]: 2,
  [TaskPriorityEnum.P3]: 3,
  [TaskPriorityEnum.P4]: 4,
};

export function getPriorityColor(priority: TaskPriorityEnum): string {
  const colorMap: Record<TaskPriorityEnum, string> = {
    [TaskPriorityEnum.P1]: '#dc2626',
    [TaskPriorityEnum.P2]: '#fb923c',
    [TaskPriorityEnum.P3]: '#0284c7',
    [TaskPriorityEnum.P4]: '#475569',
  };
  return colorMap[priority];
}
