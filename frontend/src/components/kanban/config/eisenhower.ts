/**
 * Eisenhower Matrix configuration
 */

import { TaskPriorityEnum } from '@/graphql/generated';

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
