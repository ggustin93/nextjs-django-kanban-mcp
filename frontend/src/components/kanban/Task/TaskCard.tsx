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
import { TaskType } from '../types';
import { Column, PRIORITY_CONFIG, getPriorityColor } from '../config';

interface TaskCardProps {
  task: TaskType;
  column: Column;
  onEdit: (task: TaskType) => void;
  onDelete: (id: string) => void;
  showStatusBadge?: boolean; // NEW: Show status instead of priority
  layout?: 'vertical' | 'horizontal'; // NEW: Layout mode for Eisenhower optimization
}

export function TaskCard({
  task,
  column,
  onEdit,
  onDelete,
  showStatusBadge = false,
  layout = 'vertical',
}: TaskCardProps) {
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
        borderColor: layout === 'horizontal' ? getPriorityColor(task.priority) : column.color,
        '&:hover': {
          boxShadow: 2,
          transform: isDragging ? 'none' : 'translateY(-1px)',
          transition: 'box-shadow 0.2s, transform 0.2s',
        },
        '&:active': {
          cursor: 'grabbing',
        },
      }}
      {...attributes}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        {layout === 'horizontal' ? (
          /* Horizontal Layout for Eisenhower - Optimized Height */
          <>
            {/* Top Row: Chips + Title | Buttons */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', gap: 0.5, mb: 0.75, flexWrap: 'wrap' }} {...listeners}>
                  {showStatusBadge ? (
                    <Chip
                      label={column.title}
                      color={column.chipColor}
                      size="small"
                      sx={{
                        fontWeight: 'bold',
                        minWidth: 50,
                        height: 18,
                        fontSize: '0.65rem',
                      }}
                    />
                  ) : (
                    <Chip
                      label={PRIORITY_CONFIG[task.priority].shortLabel}
                      color={PRIORITY_CONFIG[task.priority].color}
                      size="small"
                      sx={{ fontWeight: 'bold', minWidth: 28, height: 18, fontSize: '0.65rem' }}
                    />
                  )}
                  {task.category && (
                    <Chip
                      label={task.category}
                      variant="outlined"
                      size="small"
                      sx={{ height: 18, fontSize: '0.65rem' }}
                    />
                  )}
                </Box>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  {...listeners}
                  sx={{
                    cursor: 'grab',
                    '&:active': { cursor: 'grabbing' },
                    lineHeight: 1.4,
                  }}
                >
                  {task.title}
                </Typography>
              </Box>

              {/* Buttons - Always Top Right */}
              <Stack direction="row" spacing={0.25} sx={{ pointerEvents: 'auto' }}>
                <IconButton
                  size="small"
                  onClick={handleEdit}
                  sx={{
                    p: 0.5,
                    '&:hover': { bgcolor: 'action.hover' },
                    transition: 'background-color 0.2s',
                  }}
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleDelete}
                  sx={{
                    p: 0.5,
                    '&:hover': { bgcolor: 'error.light', color: 'error.contrastText' },
                    transition: 'all 0.2s',
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Stack>
            </Stack>

            {/* Description - Below Title */}
            {task.description && (
              <Typography
                variant="caption"
                color="text.secondary"
                mt={0.5}
                display="block"
                {...listeners}
                sx={{
                  cursor: 'grab',
                  '&:active': { cursor: 'grabbing' },
                  lineHeight: 1.4,
                }}
              >
                {task.description}
              </Typography>
            )}
          </>
        ) : (
          /* Vertical Layout (Default Kanban) */
          <>
            {/* Priority/Status & Category chips */}
            <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }} {...listeners}>
              {showStatusBadge ? (
                <Chip
                  label={column.title}
                  color={column.chipColor}
                  size="small"
                  sx={{
                    fontWeight: 'bold',
                    minWidth: 50,
                    height: 18,
                    fontSize: '0.65rem',
                  }}
                />
              ) : (
                <Chip
                  label={PRIORITY_CONFIG[task.priority].shortLabel}
                  color={PRIORITY_CONFIG[task.priority].color}
                  size="small"
                  sx={{ fontWeight: 'bold', minWidth: 28, height: 18, fontSize: '0.65rem' }}
                />
              )}
              {task.category && (
                <Chip
                  label={task.category}
                  variant="outlined"
                  size="small"
                  sx={{ height: 18, fontSize: '0.65rem' }}
                />
              )}
            </Box>

            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
              <Typography
                variant="body2"
                fontWeight={600}
                flex={1}
                {...listeners}
                sx={{
                  cursor: 'grab',
                  '&:active': { cursor: 'grabbing' },
                  lineHeight: 1.4,
                }}
              >
                {task.title}
              </Typography>
              <Stack direction="row" spacing={0.25} sx={{ pointerEvents: 'auto' }}>
                <IconButton
                  size="small"
                  onClick={handleEdit}
                  sx={{
                    p: 0.5,
                    '&:hover': { bgcolor: 'action.hover' },
                    transition: 'background-color 0.2s',
                  }}
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleDelete}
                  sx={{
                    p: 0.5,
                    '&:hover': { bgcolor: 'error.light', color: 'error.contrastText' },
                    transition: 'all 0.2s',
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Stack>
            </Stack>

            {task.description && (
              <Typography
                variant="caption"
                color="text.secondary"
                mt={0.5}
                display="block"
                {...listeners}
                sx={{
                  cursor: 'grab',
                  '&:active': { cursor: 'grabbing' },
                  lineHeight: 1.4,
                }}
              >
                {task.description}
              </Typography>
            )}

            <Typography
              variant="caption"
              color="text.secondary"
              mt={0.5}
              display="block"
              {...listeners}
              sx={{
                cursor: 'grab',
                '&:active': { cursor: 'grabbing' },
                fontSize: '0.65rem',
              }}
            >
              {new Date(task.createdAt).toLocaleDateString()}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
}
