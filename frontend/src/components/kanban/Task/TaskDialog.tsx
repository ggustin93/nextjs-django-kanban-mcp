/**
 * TaskDialog Component - Create/Edit task dialog
 * Single Responsibility: Handle task form UI and submission
 */
'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import { TaskFormData, TaskStatusEnum, TaskPriorityEnum } from '../types';
import { COLUMNS, PRIORITY_CONFIG } from '../config';

interface TaskDialogProps {
  open: boolean;
  isEditMode: boolean;
  formData: TaskFormData;
  loading: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onFormChange: (updates: Partial<TaskFormData>) => void;
}

export function TaskDialog({
  open,
  isEditMode,
  formData,
  loading,
  onClose,
  onSubmit,
  onFormChange,
}: TaskDialogProps) {
  const isSubmitDisabled = loading || !formData.title.trim();

  // Handle category input - strip # prefix for display, add it back on change
  const handleCategoryChange = (value: string) => {
    const cleaned = value.replace(/^#+/, '');
    onFormChange({ category: cleaned ? `#${cleaned}` : '' });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditMode ? 'Edit Task' : 'Add New Task'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            autoFocus
            label="Title"
            fullWidth
            required
            value={formData.title}
            onChange={(e) => onFormChange({ title: e.target.value })}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => onFormChange({ description: e.target.value })}
          />

          {/* Priority & Category row */}
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                label="Priority"
                onChange={(e) => onFormChange({ priority: e.target.value as TaskPriorityEnum })}
              >
                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                  <MenuItem key={key} value={key}>
                    {config.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Category"
              fullWidth
              placeholder="work, personal..."
              value={formData.category.replace(/^#/, '')}
              onChange={(e) => handleCategoryChange(e.target.value)}
              InputProps={{
                startAdornment: formData.category ? (
                  <InputAdornment position="start">#</InputAdornment>
                ) : null,
              }}
            />
          </Stack>

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              label="Status"
              onChange={(e) => onFormChange({ status: e.target.value as TaskStatusEnum })}
            >
              {COLUMNS.map((col) => (
                <MenuItem key={col.status} value={col.status}>
                  {col.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" disabled={isSubmitDisabled}>
          {loading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
