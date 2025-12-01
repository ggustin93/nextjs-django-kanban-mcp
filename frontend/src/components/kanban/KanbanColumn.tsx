/**
 * KanbanColumn Component - Single column in the kanban board
 * Single Responsibility: Render a column with its tasks
 */
'use client';

import { Box, Typography, Stack, Chip } from '@mui/material';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import { Task, Column } from './types';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export function KanbanColumn({ column, tasks, onEditTask, onDeleteTask }: KanbanColumnProps) {
  return (
    <Box sx={{ flex: '1 1 0', minWidth: 320, maxWidth: 400 }}>
      {/* Column Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} px={1}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: column.color,
            }}
          />
          <Typography variant="h6" fontWeight={600}>
            {column.title}
          </Typography>
        </Stack>
        <Chip
          label={tasks.length}
          size="small"
          sx={{
            bgcolor: column.bgColor,
            color: column.color,
            fontWeight: 600,
          }}
        />
      </Stack>

      {/* Droppable Zone */}
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
        id={column.status}
      >
        <Stack spacing={2}>
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
                p: 4,
                textAlign: 'center',
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '2px dashed',
                borderColor: 'divider',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Drop tasks here
              </Typography>
            </Box>
          )}
        </Stack>
      </SortableContext>
    </Box>
  );
}
