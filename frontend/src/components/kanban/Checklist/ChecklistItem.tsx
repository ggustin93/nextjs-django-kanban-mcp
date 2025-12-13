/**
 * ChecklistItem - Unified component for checklist items and adding new items
 *
 * Features:
 * - ChecklistItemRow: Display existing items with toggle, edit, delete
 * - AddChecklistItem: Input for creating new items
 * - Simplified callbacks (removed excessive useCallback wrappers)
 */
'use client';

import { useState, KeyboardEvent } from 'react';
import { Box, Checkbox, IconButton, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import type { ChecklistItem } from '../types';

// ============================================================================
// ChecklistItemRow - Display and edit existing checklist items
// ============================================================================

interface ChecklistItemRowProps {
  item: ChecklistItem;
  onToggle: (itemId: string) => void;
  onUpdate: (itemId: string, text: string) => void;
  onDelete: (itemId: string) => void;
  disabled?: boolean;
}

export function ChecklistItemRow({
  item,
  onToggle,
  onUpdate,
  onDelete,
  disabled = false,
}: ChecklistItemRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const [isHovered, setIsHovered] = useState(false);

  const handleToggle = (e: React.MouseEvent | React.ChangeEvent) => {
    e.stopPropagation();
    if (!disabled) {
      onToggle(item.id);
    }
  };

  const handleRowClick = () => {
    if (!disabled && !isEditing) {
      onToggle(item.id);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      setIsEditing(true);
      setEditText(item.text);
    }
  };

  const handleSave = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== item.text) {
      onUpdate(item.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditText(item.text);
      setIsEditing(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(item.id);
  };

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleRowClick}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        py: 0.5,
        px: 1,
        borderRadius: 1,
        cursor: disabled ? 'default' : 'pointer',
        '&:hover': {
          bgcolor: disabled ? 'transparent' : 'action.hover',
        },
        transition: 'background-color 0.15s ease-in-out',
      }}
    >
      <Checkbox
        size="small"
        checked={item.completed}
        disabled={disabled}
        onClick={handleToggle}
        onChange={handleToggle}
        sx={{
          p: 0.5,
          mr: 1,
          minWidth: 24,
          minHeight: 24,
          '& .MuiSvgIcon-root': { fontSize: 18 },
          '&:hover': {
            bgcolor: 'action.hover',
            borderRadius: 0.5,
          },
        }}
      />

      {isEditing ? (
        <TextField
          autoFocus
          fullWidth
          size="small"
          variant="standard"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          sx={{
            flex: 1,
            '& .MuiInput-root': { fontSize: '0.875rem' },
          }}
        />
      ) : (
        <Typography
          variant="body2"
          onDoubleClick={handleDoubleClick}
          sx={{
            flex: 1,
            pt: 0.25,
            textDecoration: item.completed ? 'line-through' : 'none',
            color: item.completed ? 'text.secondary' : 'text.primary',
            transition: 'color 0.15s, text-decoration 0.15s',
          }}
        >
          {item.text}
        </Typography>
      )}

      {isHovered && !isEditing && !disabled && (
        <IconButton
          size="small"
          onClick={handleDelete}
          sx={{
            p: 0.5,
            ml: 0.5,
            opacity: 0.6,
            '&:hover': { opacity: 1, color: 'error.main' },
          }}
        >
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}

// ============================================================================
// AddChecklistItem - Input for adding new items
// ============================================================================

interface AddChecklistItemProps {
  onAdd: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function AddChecklistItem({
  onAdd,
  disabled = false,
  placeholder = 'Add item...',
}: AddChecklistItemProps) {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (trimmed) {
      onAdd(trimmed);
      setText('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setText('');
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 1,
        py: 0.5,
        gap: 0.5,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <AddIcon
        fontSize="small"
        sx={{
          color: isFocused ? 'primary.main' : 'text.secondary',
          transition: 'color 0.15s',
          fontSize: 18,
        }}
      />
      <TextField
        fullWidth
        size="small"
        variant="standard"
        placeholder={placeholder}
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        InputProps={{
          disableUnderline: !isFocused,
        }}
        sx={{
          flex: 1,
          '& .MuiInput-root': {
            fontSize: '0.875rem',
          },
          '& .MuiInput-input': {
            py: 0.25,
          },
        }}
      />
      {text.trim() && (
        <IconButton
          size="small"
          onClick={handleSubmit}
          disabled={disabled}
          sx={{
            p: 0.5,
            color: 'primary.main',
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}
