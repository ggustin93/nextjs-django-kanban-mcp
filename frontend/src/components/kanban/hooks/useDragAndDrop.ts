/**
 * useDragAndDrop Hook - Kanban drag-and-drop with optimistic updates
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import type { Task } from '../types';
import { PRIORITY_ORDER, TaskStatus } from '../types';

interface UpdateTaskVariables {
  id: string;
  status?: TaskStatus;
  order?: number;
}

interface UpdateTaskData {
  updateTask: {
    __typename: string;
    task: Task & { __typename: string };
  };
}

type MutationFunction = (options: {
  variables: UpdateTaskVariables;
  optimisticResponse?: UpdateTaskData;
}) => Promise<unknown>;

export function useDragAndDrop(tasks: Task[], updateTask: MutationFunction) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Ref to avoid callback recreation on every render
  const tasksRef = useRef<Task[]>(tasks);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  // 1px = near-instant recognition
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 1 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const task = tasksRef.current.find((t: Task) => t.id === active.id);
    setActiveTask(task || null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);

      if (!over || active.id === over.id) return;

      const taskId = active.id as string;
      const currentTasks = tasksRef.current;
      const draggedTask = currentTasks.find((t: Task) => t.id === taskId);
      if (!draggedTask) return;

      const targetTask = currentTasks.find((t: Task) => t.id === over.id);
      const isDroppedOnColumn = Object.values(TaskStatus).includes(over.id as TaskStatus);

      let newStatus: TaskStatus;
      if (targetTask) newStatus = targetTask.status;
      else if (isDroppedOnColumn) newStatus = over.id as TaskStatus;
      else return;

      const isSameColumn = draggedTask.status === newStatus;

      if (isSameColumn && targetTask) {
        // Reorder within same column
        const columnTasks = currentTasks
          .filter((t: Task) => t.status === newStatus)
          .sort((a: Task, b: Task) => {
            if (PRIORITY_ORDER[a.priority] !== PRIORITY_ORDER[b.priority]) {
              return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
            }
            return a.order - b.order;
          });

        const oldIndex = columnTasks.findIndex((t: Task) => t.id === taskId);
        const newIndex = columnTasks.findIndex((t: Task) => t.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const reorderedTasks = arrayMove(columnTasks, oldIndex, newIndex);

          // Update order for all affected tasks (Apollo batches automatically)
          reorderedTasks.forEach((task: Task, index: number) => {
            if (task.order !== index) {
              updateTask({
                variables: { id: task.id, order: index },
                optimisticResponse: {
                  updateTask: {
                    __typename: 'UpdateTask',
                    task: {
                      ...task,
                      order: index,
                      __typename: 'TaskType',
                    },
                  },
                },
              });
            }
          });
        }
      } else {
        // Move to different column - get new order at end of target column
        const targetColumnTasks = currentTasks.filter((t: Task) => t.status === newStatus);
        const maxOrder = Math.max(...targetColumnTasks.map((t: Task) => t.order), -1);

        updateTask({
          variables: { id: taskId, status: newStatus, order: maxOrder + 1 },
          optimisticResponse: {
            updateTask: {
              __typename: 'UpdateTask',
              task: {
                ...draggedTask,
                status: newStatus,
                order: maxOrder + 1,
                __typename: 'TaskType',
              },
            },
          },
        });
      }
    },
    [updateTask]
  );

  return { sensors, activeTask, handleDragStart, handleDragEnd };
}
