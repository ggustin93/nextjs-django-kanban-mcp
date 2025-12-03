/**
 * Board Component - Kanban board orchestrator
 * Single Responsibility: Coordinate data fetching, mutations, and sub-components
 */
'use client';

import {
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useQuery, useMutation } from '@apollo/client/react/hooks';
import { GET_TASKS } from '@/graphql/queries';
import { CREATE_TASK, UPDATE_TASK, DELETE_TASK } from '@/graphql/mutations';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useState, useMemo } from 'react';
import { KanbanColumn } from './kanban/KanbanColumn';
import { TaskDialog } from './kanban/TaskDialog';
import { useTaskDialog } from './kanban/useTaskDialog';
import { FilterBar } from './kanban/FilterBar';
import { EisenhowerMatrix } from './kanban/EisenhowerMatrix';
import {
  Task,
  TaskStatus,
  COLUMNS,
  PRIORITY_ORDER,
  ViewType,
  FilterState,
  TaskPriority,
} from './kanban/types';

const REFETCH_QUERIES = [{ query: GET_TASKS }];

export function Board() {
  const dialog = useTaskDialog();
  const { data, loading, error } = useQuery(GET_TASKS);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [viewType, setViewType] = useState<ViewType>('kanban');
  const [filters, setFilters] = useState<FilterState>({
    priorities: [],
    categories: [],
    statuses: [],
    searchText: '',
  });

  const [createTask, { loading: creating }] = useMutation(CREATE_TASK, {
    refetchQueries: REFETCH_QUERIES,
  });

  const [updateTask, { loading: updating }] = useMutation(UPDATE_TASK, {
    refetchQueries: REFETCH_QUERIES,
  });

  const [deleteTask] = useMutation(DELETE_TASK, {
    refetchQueries: REFETCH_QUERIES,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const allTasks = data?.allTasks || [];
    const task = allTasks.find((t: Task) => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || active.id === over.id) return;

    const taskId = active.id as string;
    const allTasks = data?.allTasks || [];

    // Find the task that was dropped on to determine the target column
    const targetTask = allTasks.find((task: Task) => task.id === over.id);

    // If dropped on a task, use that task's status; otherwise check if dropped on column itself
    let newStatus: TaskStatus | undefined;
    if (targetTask) {
      newStatus = targetTask.status;
    } else if (Object.values(TaskStatus).includes(over.id as TaskStatus)) {
      newStatus = over.id as TaskStatus;
    }

    if (!newStatus) return;

    const draggedTask = allTasks.find((task: Task) => task.id === taskId);
    if (!draggedTask) return;

    // Optimistic update - update UI immediately
    updateTask({
      variables: { id: taskId, status: newStatus },
      optimisticResponse: {
        updateTask: {
          __typename: 'UpdateTask',
          task: {
            ...draggedTask,
            status: newStatus,
            __typename: 'TaskType',
          },
        },
      },
    });
  };

  const handleSubmit = async () => {
    if (!dialog.formData.title.trim()) return;

    if (dialog.isEditMode && dialog.editingTask) {
      await updateTask({
        variables: {
          id: dialog.editingTask.id,
          title: dialog.formData.title,
          description: dialog.formData.description,
          status: dialog.formData.status,
          priority: dialog.formData.priority,
          category: dialog.formData.category,
        },
      });
    } else {
      await createTask({
        variables: {
          title: dialog.formData.title,
          status: dialog.formData.status,
          priority: dialog.formData.priority,
          category: dialog.formData.category,
        },
      });
    }
    dialog.close();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask({ variables: { id } });
    }
  };

  const handleUpdateTaskPriority = async (id: string, priority: TaskPriority) => {
    const allTasks = data?.allTasks || [];
    const task = allTasks.find((t: Task) => t.id === id);
    if (!task) return;

    await updateTask({
      variables: { id, priority },
      optimisticResponse: {
        updateTask: {
          __typename: 'UpdateTask',
          task: {
            ...task,
            priority,
            __typename: 'TaskType',
          },
        },
      },
    });
  };

  // Extract unique categories from all tasks (MUST be before conditional returns)
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    (data?.allTasks || []).forEach((task: Task) => {
      if (task.category) categories.add(task.category);
    });
    return Array.from(categories).sort();
  }, [data]);

  // Filter tasks based on filter state (MUST be before conditional returns)
  const filteredTasks = useMemo(() => {
    let tasks = data?.allTasks || [];

    // Priority filter
    if (filters.priorities.length > 0) {
      tasks = tasks.filter((task: Task) => filters.priorities.includes(task.priority));
    }

    // Category filter
    if (filters.categories.length > 0) {
      tasks = tasks.filter((task: Task) =>
        task.category ? filters.categories.includes(task.category) : false
      );
    }

    // Status filter (for Eisenhower view)
    if (filters.statuses.length > 0) {
      tasks = tasks.filter((task: Task) => filters.statuses.includes(task.status));
    }

    // Search filter
    if (filters.searchText.trim()) {
      const search = filters.searchText.toLowerCase();
      tasks = tasks.filter(
        (task: Task) =>
          task.title.toLowerCase().includes(search) ||
          task.description?.toLowerCase().includes(search) ||
          task.category?.toLowerCase().includes(search)
      );
    }

    return tasks;
  }, [data, filters]);

  const tasksByStatus = useMemo(
    () =>
      COLUMNS.reduce(
        (acc, column) => {
          acc[column.status] = filteredTasks
            .filter((task: Task) => task.status === column.status)
            .sort((a: Task, b: Task) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
          return acc;
        },
        {} as Record<TaskStatus, Task[]>
      ),
    [filteredTasks]
  );

  const handleClearFilters = () => {
    setFilters({ priorities: [], categories: [], statuses: [], searchText: '' });
  };

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}
      >
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3, maxWidth: 600 }}>
        {error.message}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, maxWidth: 1600, mx: 'auto' }}>
      {/* Elegant Header with Refined Typography */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3.5}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'text.primary',
              mb: 0.75,
              fontSize: { xs: '1.5rem', md: '2rem' },
            }}
          >
            {viewType === 'eisenhower' ? 'Eisenhower Decision Matrix' : 'Kanban Board'}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontWeight: 400,
              fontSize: '0.875rem',
              letterSpacing: '0.01em',
            }}
          >
            {viewType === 'eisenhower'
              ? 'Prioritize by urgency and importance • Drag to change priority'
              : 'Organize tasks by status • Drag to move between columns'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ fontSize: 18 }} />}
          onClick={dialog.openForCreate}
          sx={{
            borderRadius: '8px',
            px: 3,
            py: 1.25,
            fontSize: '0.9375rem',
            fontWeight: 500,
            textTransform: 'none',
            letterSpacing: '0.01em',
            bgcolor: 'primary.main',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              bgcolor: 'primary.dark',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            },
          }}
        >
          Add Task
        </Button>
      </Stack>

      {/* Filter Bar */}
      <FilterBar
        priorities={filters.priorities}
        categories={filters.categories}
        statuses={filters.statuses}
        searchText={filters.searchText}
        availableCategories={availableCategories}
        viewType={viewType}
        onPrioritiesChange={(priorities) => setFilters({ ...filters, priorities })}
        onCategoriesChange={(categories) => setFilters({ ...filters, categories })}
        onStatusesChange={(statuses) => setFilters({ ...filters, statuses })}
        onSearchChange={(searchText) => setFilters({ ...filters, searchText })}
        onViewChange={setViewType}
        onClearFilters={handleClearFilters}
      />

      {/* Conditional View Rendering */}
      {viewType === 'eisenhower' ? (
        <EisenhowerMatrix
          tasks={filteredTasks}
          onEditTask={dialog.openForEdit}
          onDeleteTask={handleDelete}
          onUpdateTask={handleUpdateTaskPriority}
        />
      ) : (
        /* Kanban Columns with Drag-and-Drop */
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
            {COLUMNS.map((column) => (
              <KanbanColumn
                key={column.status}
                column={column}
                tasks={tasksByStatus[column.status]}
                onEditTask={dialog.openForEdit}
                onDeleteTask={handleDelete}
              />
            ))}
          </Box>
          <DragOverlay
            dropAnimation={{
              duration: 300,
              easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
            }}
          >
            {activeTask ? (
              <Card
                sx={{
                  borderLeft: 3,
                  borderColor: COLUMNS.find((c) => c.status === activeTask.status)?.color,
                  opacity: 0.9,
                  transform: 'rotate(5deg)',
                  boxShadow: 4,
                }}
              >
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {activeTask.title}
                  </Typography>
                  {activeTask.description && (
                    <Typography variant="caption" color="text.secondary" mt={0.5}>
                      {activeTask.description}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Create/Edit Dialog */}
      <TaskDialog
        open={dialog.isOpen}
        isEditMode={dialog.isEditMode}
        formData={dialog.formData}
        loading={creating || updating}
        onClose={dialog.close}
        onSubmit={handleSubmit}
        onFormChange={dialog.updateFormData}
      />
    </Box>
  );
}
