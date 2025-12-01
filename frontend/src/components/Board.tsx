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
import { useState } from 'react';
import { KanbanColumn } from './kanban/KanbanColumn';
import { TaskDialog } from './kanban/TaskDialog';
import { useTaskDialog } from './kanban/useTaskDialog';
import { Task, TaskStatus, COLUMNS } from './kanban/types';

const REFETCH_QUERIES = [{ query: GET_TASKS }];

export function Board() {
  const dialog = useTaskDialog();
  const { data, loading, error } = useQuery(GET_TASKS);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

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
        },
      });
    } else {
      await createTask({
        variables: {
          title: dialog.formData.title,
          status: dialog.formData.status,
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

  const tasksByStatus = COLUMNS.reduce(
    (acc, column) => {
      acc[column.status] = (data?.allTasks || []).filter(
        (task: Task) => task.status === column.status
      );
      return acc;
    },
    {} as Record<TaskStatus, Task[]>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={600}>
          Kanban Board
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={dialog.openForCreate}
          sx={{ borderRadius: 2 }}
        >
          Add Task
        </Button>
      </Stack>

      {/* Columns with Drag-and-Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', pb: 2 }}>
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
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600}>
                  {activeTask.title}
                </Typography>
                {activeTask.description && (
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    {activeTask.description}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

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
