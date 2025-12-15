/**
 * Centralized task filtering with multi-criteria support.
 * Filters by priority, category, status, and search text with useMemo optimization.
 */
import { useState, useMemo } from 'react';
import type { Task, FilterState } from '../types';

export function useTaskFilters(tasks: Task[]) {
  const [filters, setFilters] = useState<FilterState>({
    priorities: [],
    categories: [],
    statuses: [],
    searchText: '',
  });

  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    tasks.forEach((task: Task) => {
      if (task.category) categories.add(task.category);
    });
    return Array.from(categories).sort();
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (filters.priorities.length > 0) {
      result = result.filter((task: Task) => filters.priorities.includes(task.priority));
    }

    if (filters.categories.length > 0) {
      result = result.filter((task: Task) =>
        task.category ? filters.categories.includes(task.category) : false
      );
    }

    if (filters.statuses.length > 0) {
      result = result.filter((task: Task) => filters.statuses.includes(task.status));
    }

    if (filters.searchText.trim()) {
      const search = filters.searchText.toLowerCase();
      result = result.filter(
        (task: Task) =>
          task.title.toLowerCase().includes(search) ||
          task.description?.toLowerCase().includes(search) ||
          task.category?.toLowerCase().includes(search)
      );
    }

    return result;
  }, [tasks, filters]);

  const handleClearFilters = () => {
    setFilters({ priorities: [], categories: [], statuses: [], searchText: '' });
  };

  return {
    filters,
    setFilters,
    availableCategories,
    filteredTasks,
    handleClearFilters,
  };
}
