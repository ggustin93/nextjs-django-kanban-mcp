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
import { useQuery } from '@apollo/client/react';
import { GET_TASKS } from '@/graphql/queries';
import { useTaskMutations } from './hooks/useTaskMutations';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { useState, useMemo, useEffect } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { TaskDialog } from './Task/TaskDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { FilterBar } from './FilterBar';
import { EisenhowerMatrix } from './EisenhowerMatrix';
import { useTaskDialog } from './hooks/useTaskDialog';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { useTaskFilters } from './hooks/useTaskFilters';
import {
  Task,
  TaskStatus,
  COLUMNS,
  PRIORITY_ORDER,
  ViewType,
  TaskPriority,
  GetTasksData,
} from './types';

export function Board() {
  // Track hydration state to prevent SSR/client mismatch
  // Server renders loading UI, client must match on first render
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const dialog = useTaskDialog();
  const { data, loading, error } = useQuery<GetTasksData>(GET_TASKS);
  const [viewType, setViewType] = useState<ViewType>('kanban');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<{ id: string; title: string } | null>(null);

  // Centralized filter state and logic
  const { filters, setFilters, availableCategories, filteredTasks, handleClearFilters } =
    useTaskFilters(data?.allTasks || []);

  const { createTask, updateTask, deleteTask, creating, updating, createOptimisticUpdate } =
    useTaskMutations();

  // Drag-and-drop coordination
  const { sensors, activeTask, handleDragStart, handleDragEnd } = useDragAndDrop(
    data?.allTasks || [],
    updateTask
  );

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

  const handleDelete = (id: string) => {
    const allTasks = data?.allTasks || [];
    const task = allTasks.find((t: Task) => t.id === id);
    if (!task) return;

    setTaskToDelete({ id, title: task.title });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    await deleteTask({ variables: { id: taskToDelete.id } });
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  const handleUpdateTaskPriority = async (id: string, priority: TaskPriority) => {
    const allTasks = data?.allTasks || [];
    const task = allTasks.find((t: Task) => t.id === id);
    if (!task) return;

    await updateTask({
      variables: { id, priority },
      optimisticResponse: createOptimisticUpdate(task, { priority }),
    });
  };

  const handleReorderTasks = async (reorderedTasks: { id: string; order: number }[]) => {
    const allTasks = data?.allTasks || [];

    // Use Promise.allSettled to prevent partial failure cascades
    // If one update fails, others still complete (better UX than all-or-nothing)
    const updatePromises = reorderedTasks
      .map(({ id, order }) => {
        const task = allTasks.find((t: Task) => t.id === id);
        if (!task || task.order === order) return null;

        return updateTask({
          variables: { id, order },
          optimisticResponse: createOptimisticUpdate(task, { order }),
        });
      })
      .filter(Boolean);

    const results = await Promise.allSettled(updatePromises);

    // Log failures for debugging (production would use proper error tracking)
    const failures = results.filter((r) => r.status === 'rejected');
    if (failures.length > 0) {
      console.error('Task reorder failures:', failures);
    }
  };

  // Update task description (used for checkbox toggling)
  const handleUpdateTaskDescription = async (id: string, description: string) => {
    const allTasks = data?.allTasks || [];
    const task = allTasks.find((t: Task) => t.id === id);
    if (!task) return;

    await updateTask({
      variables: { id, description },
      optimisticResponse: createOptimisticUpdate(task, { description }),
    });
  };

  const tasksByStatus = useMemo(
    () =>
      COLUMNS.reduce(
        (acc, column) => {
          acc[column.status] = filteredTasks
            .filter((task: Task) => task.status === column.status)
            .sort((a: Task, b: Task) => {
              // First sort by priority
              if (PRIORITY_ORDER[a.priority] !== PRIORITY_ORDER[b.priority]) {
                return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
              }
              // Then by order within same priority
              return a.order - b.order;
            });
          return acc;
        },
        {} as Record<TaskStatus, Task[]>
      ),
    [filteredTasks]
  );

  // Show loading spinner until hydration is complete and data is loaded
  // This ensures SSR output matches initial client render (both show spinner)
  if (!isMounted || loading) {
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
          onReorderTasks={handleReorderTasks}
          onUpdateDescription={handleUpdateTaskDescription}
        />
      ) : (
        /* Kanban Columns with Drag-and-Drop */
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
            {COLUMNS.map((column) => (
              <KanbanColumn
                key={column.status}
                column={column}
                tasks={tasksByStatus[column.status]}
                onEditTask={dialog.openForEdit}
                onDeleteTask={handleDelete}
                onUpdateDescription={handleUpdateTaskDescription}
              />
            ))}
          </Box>
          <DragOverlay
            dropAnimation={{
              duration: 250,
              easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
            }}
          >
            {activeTask ? (
              <Card
                sx={{
                  borderLeft: 4,
                  borderColor: COLUMNS.find((c) => c.status === activeTask.status)?.color,
                  opacity: 0.9,
                  boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
                  cursor: 'grabbing',
                  pointerEvents: 'none',
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        taskTitle={taskToDelete?.title || ''}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Box>
  );
}
