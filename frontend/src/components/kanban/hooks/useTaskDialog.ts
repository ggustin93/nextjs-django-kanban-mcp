/**
 * useTaskDialog Hook - Manage task dialog state
 * Single Responsibility: Handle dialog open/close and form state management
 */
import { useState } from 'react';
import { TaskType, TaskFormData, TaskStatusEnum, TaskPriorityEnum } from '../types';

const INITIAL_FORM_DATA: TaskFormData = {
  title: '',
  description: '',
  status: TaskStatusEnum.Todo,
  priority: TaskPriorityEnum.P4,
  category: '',
};

export function useTaskDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);
  const [formData, setFormData] = useState<TaskFormData>(INITIAL_FORM_DATA);

  const openForCreate = () => {
    setEditingTask(null);
    setFormData(INITIAL_FORM_DATA);
    setIsOpen(true);
  };

  const openForEdit = (task: TaskType) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      category: task.category || '',
    });
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setEditingTask(null);
    setFormData(INITIAL_FORM_DATA);
  };

  const updateFormData = (updates: Partial<TaskFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  return {
    isOpen,
    editingTask,
    formData,
    isEditMode: editingTask !== null,
    openForCreate,
    openForEdit,
    close,
    updateFormData,
  };
}
