/**
 * TaskCard Component - Draggable kanban task card
 * Single Responsibility: Display and handle interactions for a single task
 */
'use client';

import { Card, CardContent, Typography, Stack, IconButton, Chip, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, Column, PRIORITY_CONFIG } from './types';

interface TaskCardProps {
  task: Task;
  column: Column;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, column, onEdit, onDelete }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    transition: {
      duration: 300,
      easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    },
  });

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onEdit(task);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete(task.id);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 300ms cubic-bezier(0.25, 0.1, 0.25, 1)',
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      sx={{
        borderLeft: 3,
        borderColor: column.color,
        '&:hover': {
          boxShadow: 3,
          transform: isDragging ? 'none' : 'translateY(-2px)',
          transition: 'box-shadow 0.2s, transform 0.2s',
        },
        '&:active': {
          cursor: 'grabbing',
        },
      }}
      {...attributes}
    >
      <CardContent>
        {/* Priority & Category chips */}
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }} {...listeners}>
          <Chip
            label={PRIORITY_CONFIG[task.priority].shortLabel}
            color={PRIORITY_CONFIG[task.priority].color}
            size="small"
            sx={{ fontWeight: 'bold', minWidth: 32, height: 20, fontSize: '0.7rem' }}
          />
          {task.category && (
            <Chip
              label={task.category}
              variant="outlined"
              size="small"
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          )}
        </Box>

        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Typography
            variant="subtitle1"
            fontWeight={600}
            flex={1}
            {...listeners}
            sx={{ cursor: 'grab', '&:active': { cursor: 'grabbing' } }}
          >
            {task.title}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ pointerEvents: 'auto' }}>
            <IconButton
              size="small"
              onClick={handleEdit}
              sx={{
                '&:hover': { bgcolor: 'action.hover' },
                transition: 'background-color 0.2s',
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleDelete}
              sx={{
                '&:hover': { bgcolor: 'error.light', color: 'error.contrastText' },
                transition: 'all 0.2s',
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>

        {task.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            mt={1}
            {...listeners}
            sx={{ cursor: 'grab', '&:active': { cursor: 'grabbing' } }}
          >
            {task.description}
          </Typography>
        )}

        <Typography
          variant="caption"
          color="text.secondary"
          mt={1}
          display="block"
          {...listeners}
          sx={{ cursor: 'grab', '&:active': { cursor: 'grabbing' } }}
        >
          {new Date(task.createdAt).toLocaleDateString()}
        </Typography>
      </CardContent>
    </Card>
  );
}
