/**
 * TaskCard Component - Draggable kanban task card
 * Single Responsibility: Display and handle interactions for a single task
 *
 * Design: Clean KISS layout
 * - Title: top-left (prominent)
 * - Priority/Status badge: top-right (discrete)
 * - Category: bottom-right (subtle)
 * - Edit/Delete buttons: visible on hover only
 * - Date: visible on hover only (bottom-left)
 */
'use client';

import { useState, memo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Stack,
  IconButton,
  Chip,
  Box,
  Collapse,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, Column, PRIORITY_CONFIG, getPriorityColor } from '../types';
import { MarkdownText } from '../../common/MarkdownText';
import { InlineChecklist } from '../Checklist';

interface TaskCardProps {
  task: Task;
  column: Column;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onUpdateDescription?: (id: string, description: string) => void;
  showStatusBadge?: boolean; // Show status instead of priority
  layout?: 'vertical' | 'horizontal'; // Layout mode for Eisenhower optimization
}

export const TaskCard = memo(function TaskCard({
  task,
  column,
  onEdit,
  onDelete,
  onUpdateDescription,
  showStatusBadge = false,
  layout = 'vertical',
}: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    transition: {
      duration: 150,
      easing: 'ease-out',
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

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsExpanded(!isExpanded);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    // Only toggle if card has expandable content and double-click is not on a button
    if (hasExpandableContent && !(e.target as HTMLElement).closest('button')) {
      e.stopPropagation();
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  // Check if card has expandable content
  const hasExpandableContent = task.description || task.category || true; // Checklist always available

  // Calculate checklist completion
  const checklistItems = task.checklists?.[0]?.items ?? [];
  const completedCount = checklistItems.filter((item) => item.completed).length;
  const totalCount = checklistItems.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const hasChecklist = totalCount > 0;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.6 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    willChange: isDragging ? 'transform' : 'auto', // GPU acceleration during drag only
  };

  // Common styles for action buttons
  const actionButtonStyles = {
    p: 0.5,
    opacity: isHovered ? 1 : 0,
    transform: isHovered ? 'scale(1)' : 'scale(0.8)',
    transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
    pointerEvents: isHovered ? 'auto' : 'none',
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        borderLeft: 3,
        borderColor: layout === 'horizontal' ? getPriorityColor(task.priority) : column.color,
        transition: isDragging ? 'none' : 'box-shadow 0.1s, background-color 0.1s',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'manipulation',
        '&:hover': {
          bgcolor: isDragging ? undefined : 'action.hover', // Subtle highlight
          boxShadow: isDragging ? undefined : 2,
        },
      }}
      {...attributes}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }} onDoubleClick={handleDoubleClick}>
        {/* Row 1: Expand + Title (left) + Actions + Badge (right) */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={0.5}>
          {/* Left side: Expand button + Title */}
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="flex-start"
            sx={{ flex: 1, minWidth: 0 }}
          >
            {/* Expand button - only if has expandable content */}
            {hasExpandableContent && (
              <IconButton
                size="small"
                onClick={handleToggleExpand}
                sx={{
                  p: 0.25,
                  mt: 0.1,
                  transition: 'transform 0.2s ease-out',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  flexShrink: 0,
                }}
              >
                <ExpandMoreIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}

            {/* Title */}
            <Typography
              variant="body2"
              fontWeight={600}
              flex={1}
              {...listeners}
              sx={{
                cursor: 'grab',
                '&:active': { cursor: 'grabbing' },
                lineHeight: 1.4,
                minWidth: 0,
                wordBreak: 'break-word',
                // Add left padding when no expand button to align with cards that have one
                pl: hasExpandableContent ? 0 : 2.5,
              }}
            >
              {task.title}
            </Typography>
          </Stack>

          {/* Right side: Action buttons (hover) + Completion + Badge */}
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
            {/* Edit button - hover only */}
            <IconButton
              size="small"
              onClick={handleEdit}
              sx={{
                ...actionButtonStyles,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <EditIcon sx={{ fontSize: 14 }} />
            </IconButton>

            {/* Delete button - hover only */}
            <IconButton
              size="small"
              onClick={handleDelete}
              sx={{
                ...actionButtonStyles,
                '&:hover': { bgcolor: 'error.light', color: 'error.contrastText' },
              }}
            >
              <DeleteIcon sx={{ fontSize: 14 }} />
            </IconButton>

            {/* Checklist Completion Indicator - Refined & Elegant */}
            {hasChecklist && (
              <Box
                sx={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 0.75,
                }}
              >
                {/* Background glow for completed */}
                {completionPercentage === 100 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background:
                        'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0) 70%)',
                      animation: 'pulse 2s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%, 100%': {
                          opacity: 0.6,
                          transform: 'scale(1)',
                        },
                        '50%': {
                          opacity: 1,
                          transform: 'scale(1.15)',
                        },
                      },
                    }}
                  />
                )}

                <CircularProgress
                  variant="determinate"
                  value={completionPercentage}
                  size={26}
                  thickness={4}
                  sx={{
                    color: '#10b981',
                    ...(completionPercentage === 100 && {
                      filter: 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.4))',
                    }),
                  }}
                />

                <Box
                  sx={{
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.55rem',
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      color: '#10b981', // Always emerald green
                      transition: 'color 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      textShadow:
                        completionPercentage === 100 ? '0 0 8px rgba(16, 185, 129, 0.3)' : 'none',
                    }}
                  >
                    {completionPercentage}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Priority/Status Badge - Top Right */}
            {showStatusBadge ? (
              <Chip
                label={column.title}
                color={column.chipColor}
                size="small"
                sx={{
                  fontWeight: 600,
                  height: 20,
                  fontSize: '0.65rem',
                  color: '#fff',
                  '& .MuiChip-label': { px: 1, color: '#fff' },
                }}
              />
            ) : (
              <Chip
                label={PRIORITY_CONFIG[task.priority].shortLabel}
                color={PRIORITY_CONFIG[task.priority].color}
                size="small"
                sx={{
                  fontWeight: 600,
                  height: 20,
                  fontSize: '0.65rem',
                  color: '#fff',
                  '& .MuiChip-label': { px: 0.75, color: '#fff' },
                }}
              />
            )}
          </Stack>
        </Stack>

        {/* Accordion Content: Description + Category + Date */}
        <Collapse in={isExpanded} timeout={200}>
          {/* Description with Markdown support */}
          {task.description && (
            <Box
              mt={1}
              sx={{
                color: 'text.secondary',
                opacity: 0.85,
              }}
            >
              <MarkdownText
                onCheckboxChange={
                  onUpdateDescription
                    ? (newContent) => onUpdateDescription(task.id, newContent)
                    : undefined
                }
              >
                {task.description}
              </MarkdownText>
            </Box>
          )}

          {/* Simplified Checklist (KISS - max 1 per task, no accordion) */}
          <InlineChecklist checklist={task.checklists?.[0] ?? null} taskId={task.id} />

          {/* Footer - Date (left) + Category (right) */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 1,
              minHeight: 20,
            }}
            {...listeners}
          >
            {/* Date - Bottom Left */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontSize: '0.6rem',
                opacity: 0.7,
                cursor: 'grab',
                '&:active': { cursor: 'grabbing' },
              }}
            >
              {new Date(task.createdAt).toLocaleDateString()}
            </Typography>

            {/* Category - Bottom Right (subtle) */}
            {task.category && (
              <Chip
                label={task.category}
                variant="outlined"
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.6rem',
                  opacity: 0.7,
                  borderColor: 'divider',
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
});
