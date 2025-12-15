/**
 * KanbanColumn Component - Single column in the kanban board
 * Single Responsibility: Render a column with its tasks
 */
'use client';

import { Box, Typography, Stack } from '@mui/material';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { TaskCard } from './Task/TaskCard';
import { TaskType } from './types';
import { Column } from './config';

interface KanbanColumnProps {
  column: Column;
  tasks: TaskType[];
  onEditTask: (task: TaskType) => void;
  onDeleteTask: (id: string) => void;
}

export function KanbanColumn({ column, tasks, onEditTask, onDeleteTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.status,
  });

  return (
    <Box sx={{ flex: '1 1 0', minWidth: 280, maxWidth: 360 }}>
      {/* Column Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} px={1}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: column.color,
            }}
          />
          <Typography variant="subtitle1" fontWeight={700}>
            {column.title}
          </Typography>
        </Stack>
        <Box
          sx={{
            px: 1,
            py: 0.25,
            borderRadius: 1,
            bgcolor: column.bgColor,
            color: column.color,
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          {tasks.length}
        </Box>
      </Stack>

      {/* Droppable Zone */}
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <Stack
          ref={setNodeRef}
          spacing={1.5}
          sx={{
            minHeight: 200,
            transition: 'background-color 0.2s',
            bgcolor: isOver ? 'action.hover' : 'transparent',
            borderRadius: 2,
            p: 1,
          }}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              column={column}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}

          {tasks.length === 0 && (
            <Box
              sx={{
                p: 3,
                textAlign: 'center',
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '2px dashed',
                borderColor: isOver ? column.color : 'divider',
                transition: 'border-color 0.2s',
              }}
            >
              <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                Drop here
              </Typography>
            </Box>
          )}
        </Stack>
      </SortableContext>
    </Box>
  );
}
