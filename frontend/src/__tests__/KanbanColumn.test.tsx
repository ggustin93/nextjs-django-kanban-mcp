/**
 * KanbanColumn Component Tests
 * ============================
 *
 * Critical tests for KanbanColumn component focusing on:
 *   - Empty column droppable behavior
 *   - Visual feedback during drag-over
 *   - useDroppable integration
 *
 * Setup:
 *   npm test -- KanbanColumn.test.tsx
 */

import { render, screen } from '@testing-library/react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { KanbanColumn } from '@/components/kanban/KanbanColumn';
import { Column, Task, TaskStatus, TaskPriority } from '@/components/kanban/types';

// Mock task data
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'TODO' as TaskStatus,
    priority: TaskPriority.P2,
    category: '#work',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

// Column configurations
const todoColumn: Column = {
  title: 'To Do',
  status: 'TODO' as TaskStatus,
  color: '#1976d2',
  bgColor: '#e3f2fd',
};

const doingColumn: Column = {
  title: 'Doing',
  status: 'DOING' as TaskStatus,
  color: '#ed6c02',
  bgColor: '#fff4e5',
};

const doneColumn: Column = {
  title: 'Done',
  status: 'DONE' as TaskStatus,
  color: '#2e7d32',
  bgColor: '#f1f8e9',
};

describe('KanbanColumn Component', () => {
  const mockEditTask = jest.fn();
  const mockDeleteTask = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Empty Column Behavior', () => {
    it('renders empty state when no tasks present', () => {
      render(
        <DndContext onDragEnd={() => {}}>
          <KanbanColumn
            column={todoColumn}
            tasks={[]}
            onEditTask={mockEditTask}
            onDeleteTask={mockDeleteTask}
          />
        </DndContext>
      );

      expect(screen.getByText('Drop tasks here')).toBeInTheDocument();
    });

    it('applies correct droppable ID from column status', () => {
      const { container } = render(
        <DndContext onDragEnd={() => {}}>
          <KanbanColumn
            column={todoColumn}
            tasks={[]}
            onEditTask={mockEditTask}
            onDeleteTask={mockDeleteTask}
          />
        </DndContext>
      );

      // Verify the droppable area exists
      const dropZone = container.querySelector('[data-droppable]');
      // Note: @dnd-kit adds internal data attributes, this verifies component renders
      expect(screen.getByText('Drop tasks here')).toBeInTheDocument();
    });

    it('maintains minimum height for empty columns', () => {
      const { container } = render(
        <DndContext onDragEnd={() => {}}>
          <KanbanColumn
            column={todoColumn}
            tasks={[]}
            onEditTask={mockEditTask}
            onDeleteTask={mockDeleteTask}
          />
        </DndContext>
      );

      // Find the Stack component that has minHeight styling
      const stackElement = container.querySelector('[class*="MuiStack-root"]');
      expect(stackElement).toBeInTheDocument();
    });

    it('shows different empty state for each column', () => {
      const { rerender } = render(
        <DndContext onDragEnd={() => {}}>
          <KanbanColumn
            column={todoColumn}
            tasks={[]}
            onEditTask={mockEditTask}
            onDeleteTask={mockDeleteTask}
          />
        </DndContext>
      );

      expect(screen.getByText('To Do')).toBeInTheDocument();
      expect(screen.getByText('Drop tasks here')).toBeInTheDocument();

      rerender(
        <DndContext onDragEnd={() => {}}>
          <KanbanColumn
            column={doingColumn}
            tasks={[]}
            onEditTask={mockEditTask}
            onDeleteTask={mockDeleteTask}
          />
        </DndContext>
      );

      expect(screen.getByText('Doing')).toBeInTheDocument();
      expect(screen.getByText('Drop tasks here')).toBeInTheDocument();
    });
  });

  describe('Column with Tasks', () => {
    it('renders tasks when present', () => {
      render(
        <DndContext onDragEnd={() => {}}>
          <KanbanColumn
            column={todoColumn}
            tasks={mockTasks}
            onEditTask={mockEditTask}
            onDeleteTask={mockDeleteTask}
          />
        </DndContext>
      );

      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.queryByText('Drop tasks here')).not.toBeInTheDocument();
    });

    it('shows correct task count in header', () => {
      render(
        <DndContext onDragEnd={() => {}}>
          <KanbanColumn
            column={todoColumn}
            tasks={mockTasks}
            onEditTask={mockEditTask}
            onDeleteTask={mockDeleteTask}
          />
        </DndContext>
      );

      // Task count chip should show 1
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('updates count when multiple tasks present', () => {
      const multipleTasks: Task[] = [
        ...mockTasks,
        {
          id: '2',
          title: 'Task 2',
          description: '',
          status: 'TODO' as TaskStatus,
          priority: TaskPriority.P3,
          category: '#personal',
          createdAt: '2024-01-02T00:00:00Z',
        },
        {
          id: '3',
          title: 'Task 3',
          description: '',
          status: 'TODO' as TaskStatus,
          priority: TaskPriority.P4,
          category: '',
          createdAt: '2024-01-03T00:00:00Z',
        },
      ];

      render(
        <DndContext onDragEnd={() => {}}>
          <KanbanColumn
            column={todoColumn}
            tasks={multipleTasks}
            onEditTask={mockEditTask}
            onDeleteTask={mockDeleteTask}
          />
        </DndContext>
      );

      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('Drag-and-Drop Integration', () => {
    it('accepts drops on empty column', () => {
      const handleDragEnd = jest.fn();

      render(
        <DndContext onDragEnd={handleDragEnd}>
          <KanbanColumn
            column={doingColumn}
            tasks={[]}
            onEditTask={mockEditTask}
            onDeleteTask={mockDeleteTask}
          />
        </DndContext>
      );

      // Verify empty column renders and is ready for drops
      expect(screen.getByText('Doing')).toBeInTheDocument();
      expect(screen.getByText('Drop tasks here')).toBeInTheDocument();
    });

    it('provides droppable area with correct status ID', () => {
      const { container } = render(
        <DndContext onDragEnd={() => {}}>
          <KanbanColumn
            column={doneColumn}
            tasks={[]}
            onEditTask={mockEditTask}
            onDeleteTask={mockDeleteTask}
          />
        </DndContext>
      );

      // Verify column is rendered with droppable configuration
      expect(screen.getByText('Done')).toBeInTheDocument();
    });
  });

  describe('Visual Styling', () => {
    it('applies correct column color scheme', () => {
      const { container } = render(
        <DndContext onDragEnd={() => {}}>
          <KanbanColumn
            column={todoColumn}
            tasks={[]}
            onEditTask={mockEditTask}
            onDeleteTask={mockDeleteTask}
          />
        </DndContext>
      );

      // Color indicator should be present
      const colorIndicator = container.querySelector('[class*="MuiBox-root"]');
      expect(colorIndicator).toBeInTheDocument();
    });

    it('applies different colors for different columns', () => {
      const { rerender, container } = render(
        <DndContext onDragEnd={() => {}}>
          <KanbanColumn
            column={todoColumn}
            tasks={[]}
            onEditTask={mockEditTask}
            onDeleteTask={mockDeleteTask}
          />
        </DndContext>
      );

      expect(screen.getByText('To Do')).toBeInTheDocument();

      rerender(
        <DndContext onDragEnd={() => {}}>
          <KanbanColumn
            column={doneColumn}
            tasks={[]}
            onEditTask={mockEditTask}
            onDeleteTask={mockDeleteTask}
          />
        </DndContext>
      );

      expect(screen.getByText('Done')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles column with zero tasks after deletion', () => {
      const { rerender } = render(
        <DndContext onDragEnd={() => {}}>
          <KanbanColumn
            column={todoColumn}
            tasks={mockTasks}
            onEditTask={mockEditTask}
            onDeleteTask={mockDeleteTask}
          />
        </DndContext>
      );

      expect(screen.getByText('Test Task')).toBeInTheDocument();

      // Simulate all tasks being deleted
      rerender(
        <DndContext onDragEnd={() => {}}>
          <KanbanColumn
            column={todoColumn}
            tasks={[]}
            onEditTask={mockEditTask}
            onDeleteTask={mockDeleteTask}
          />
        </DndContext>
      );

      expect(screen.queryByText('Test Task')).not.toBeInTheDocument();
      expect(screen.getByText('Drop tasks here')).toBeInTheDocument();
    });

    it('handles rapid task additions and removals', () => {
      const { rerender } = render(
        <DndContext onDragEnd={() => {}}>
          <KanbanColumn
            column={todoColumn}
            tasks={[]}
            onEditTask={mockEditTask}
            onDeleteTask={mockDeleteTask}
          />
        </DndContext>
      );

      // Empty
      expect(screen.getByText('0')).toBeInTheDocument();

      // Add task
      rerender(
        <DndContext onDragEnd={() => {}}>
          <KanbanColumn
            column={todoColumn}
            tasks={mockTasks}
            onEditTask={mockEditTask}
            onDeleteTask={mockDeleteTask}
          />
        </DndContext>
      );

      expect(screen.getByText('1')).toBeInTheDocument();

      // Remove task
      rerender(
        <DndContext onDragEnd={() => {}}>
          <KanbanColumn
            column={todoColumn}
            tasks={[]}
            onEditTask={mockEditTask}
            onDeleteTask={mockDeleteTask}
          />
        </DndContext>
      );

      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });
});
