/**
 * useTaskMutations - Consolidated task mutations with optimistic updates
 */
import { useMutation } from '@apollo/client/react';
import { CREATE_TASK, UPDATE_TASK, DELETE_TASK } from '@/graphql/mutations';
import { GET_TASKS } from '@/graphql/queries';
import { Task, CreateTaskData, UpdateTaskData, DeleteTaskData } from '../types';

const REFETCH_QUERIES = [{ query: GET_TASKS }];

/** Helper to create optimistic update response for UPDATE_TASK */
export function createOptimisticUpdate(task: Task, updates: Partial<Task>) {
  return {
    updateTask: {
      __typename: 'UpdateTask' as const,
      task: { ...task, ...updates, __typename: 'TaskType' as const },
    },
  };
}

export function useTaskMutations() {
  const [createTask, { loading: creating }] = useMutation<CreateTaskData>(CREATE_TASK, {
    refetchQueries: REFETCH_QUERIES,
  });

  const [updateTask, { loading: updating }] = useMutation<UpdateTaskData>(UPDATE_TASK, {
    refetchQueries: REFETCH_QUERIES,
  });

  const [deleteTask, { loading: deleting }] = useMutation<DeleteTaskData>(DELETE_TASK, {
    refetchQueries: REFETCH_QUERIES,
  });

  return {
    createTask,
    updateTask,
    deleteTask,
    creating,
    updating,
    deleting,
    isLoading: creating || updating || deleting,
    createOptimisticUpdate,
  };
}
