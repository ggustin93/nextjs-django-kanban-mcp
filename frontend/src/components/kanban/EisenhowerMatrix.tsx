/**
 * EisenhowerMatrix Component - Eisenhower Matrix view with drag-and-drop
 * Single Responsibility: Display tasks in Eisenhower Matrix (Urgent/Important quadrants)
 */
'use client';

import { Box, Typography, Stack, Card, CardContent } from '@mui/material';
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
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { useState } from 'react';
import {
  Task,
  EISENHOWER_QUADRANTS,
  EisenhowerQuadrantConfig,
  TaskPriority,
  COLUMNS,
} from './types';
import { TaskCard } from './Task/TaskCard';

interface EisenhowerMatrixProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, priority: TaskPriority) => void; // NEW: Handle priority change
}

function EisenhowerQuadrant({
  quadrantConfig,
  tasks,
  onEditTask,
  onDeleteTask,
}: {
  quadrantConfig: EisenhowerQuadrantConfig;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: quadrantConfig.quadrant,
  });

  return (
    <Box
      sx={{
        flex: '1 1 0',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Modern Gradient Header */}
      <Box
        sx={{
          mb: 2,
          px: 2,
          py: 1.25,
          background: quadrantConfig.color,
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'rgba(0, 0, 0, 0.08)',
        }}
      >
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              color: '#0f172a',
              fontWeight: 600,
              lineHeight: 1.3,
              fontSize: '0.9375rem',
              letterSpacing: '-0.01em',
              mb: 0.25,
            }}
          >
            {quadrantConfig.title}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 500,
              fontSize: '0.6875rem',
            }}
          >
            {quadrantConfig.subtitle}
          </Typography>
        </Box>
        <Box
          sx={{
            color: '#0f172a',
            fontWeight: 600,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            px: 1.25,
            py: 0.5,
            borderRadius: '6px',
            fontSize: '0.8125rem',
            minWidth: 32,
            textAlign: 'center',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
          }}
        >
          {tasks.length}
        </Box>
      </Box>

      {/* Droppable Zone */}
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <Stack
          ref={setNodeRef}
          spacing={1.5}
          sx={{
            overflowY: 'auto',
            flex: 1,
            minHeight: 200,
            transition: 'background-color 0.2s',
            bgcolor: isOver ? 'action.hover' : 'transparent',
            borderRadius: 2,
            p: 1,
          }}
        >
          {tasks.map((task) => {
            const column = COLUMNS.find((c) => c.status === task.status) || COLUMNS[0];
            return (
              <TaskCard
                key={task.id}
                task={task}
                column={column}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                showStatusBadge={true}
              />
            );
          })}

          {tasks.length === 0 && (
            <Box
              sx={{
                p: 4,
                textAlign: 'center',
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '2px dashed',
                borderColor: isOver ? quadrantConfig.color : 'divider',
                transition: 'border-color 0.2s',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Drop {quadrantConfig.priority} tasks here
              </Typography>
            </Box>
          )}
        </Stack>
      </SortableContext>
    </Box>
  );
}

export function EisenhowerMatrix({
  tasks,
  onEditTask,
  onDeleteTask,
  onUpdateTask,
}: EisenhowerMatrixProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

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

  const tasksByQuadrant = EISENHOWER_QUADRANTS.reduce(
    (acc, quadrant) => {
      acc[quadrant.quadrant] = tasks.filter((task) => task.priority === quadrant.priority);
      return acc;
    },
    {} as Record<string, Task[]>
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || active.id === over.id) return;

    const taskId = active.id as string;

    // Check if dropped on a quadrant
    const targetQuadrant = EISENHOWER_QUADRANTS.find((q) => q.quadrant === over.id);
    if (targetQuadrant) {
      onUpdateTask(taskId, targetQuadrant.priority);
      return;
    }

    // Check if dropped on another task
    const targetTask = tasks.find((task) => task.id === over.id);
    if (targetTask) {
      onUpdateTask(taskId, targetTask.priority);
    }
  };

  return (
    <Box>
      {/* Matrix Grid with Drag-and-Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 4,
            '& > *': {
              minHeight: { xs: 'auto', md: 500 },
            },
            p: 2,
            borderRadius: 2,
            bgcolor: 'grey.50',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {EISENHOWER_QUADRANTS.map((quadrant) => (
            <EisenhowerQuadrant
              key={quadrant.quadrant}
              quadrantConfig={quadrant}
              tasks={tasksByQuadrant[quadrant.quadrant] || []}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </Box>

        {/* Drag Overlay */}
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
                borderColor: EISENHOWER_QUADRANTS.find((q) => q.priority === activeTask.priority)
                  ?.color,
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

      {/* Legend */}
      <Box
        sx={{
          mt: 4,
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={600}
          display="block"
          mb={1}
        >
          Priority Mapping
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          {EISENHOWER_QUADRANTS.map((quadrant) => (
            <Typography key={quadrant.quadrant} variant="caption" color="text.secondary">
              <Box
                component="span"
                sx={{
                  display: 'inline-block',
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: quadrant.color,
                  mr: 0.5,
                }}
              />
              {quadrant.priority}: {quadrant.title}
            </Typography>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
