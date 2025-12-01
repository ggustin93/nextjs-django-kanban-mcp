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
} from '@mui/material';
import { TaskFormData, TaskStatus, COLUMNS } from './types';

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
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              label="Status"
              onChange={(e) => onFormChange({ status: e.target.value as TaskStatus })}
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
