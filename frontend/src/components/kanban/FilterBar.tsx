/**
 * FilterBar Component - Compact task filtering controls
 * Single Responsibility: Manage task filters with minimal vertical space
 */
'use client';

import {
  Box,
  Stack,
  Chip,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Collapse,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import GridViewIcon from '@mui/icons-material/GridView';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { useState } from 'react';
import { TaskPriorityEnum, TaskStatusEnum, ViewType } from './types';
import { PRIORITY_CONFIG, COLUMNS } from './config';

interface FilterBarProps {
  priorities: TaskPriorityEnum[];
  categories: string[];
  statuses: TaskStatusEnum[];
  searchText: string;
  availableCategories: string[];
  viewType: ViewType;
  onPrioritiesChange: (priorities: TaskPriorityEnum[]) => void;
  onCategoriesChange: (categories: string[]) => void;
  onStatusesChange: (statuses: TaskStatusEnum[]) => void;
  onSearchChange: (search: string) => void;
  onViewChange: (view: ViewType) => void;
  onClearFilters: () => void;
}

export function FilterBar({
  priorities,
  categories,
  statuses,
  searchText,
  availableCategories,
  viewType,
  onPrioritiesChange,
  onCategoriesChange,
  onStatusesChange,
  onSearchChange,
  onViewChange,
  onClearFilters,
}: FilterBarProps) {
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const togglePriority = (priority: TaskPriorityEnum) => {
    if (priorities.includes(priority)) {
      onPrioritiesChange(priorities.filter((p) => p !== priority));
    } else {
      onPrioritiesChange([...priorities, priority]);
    }
  };

  const toggleCategory = (category: string) => {
    if (categories.includes(category)) {
      onCategoriesChange(categories.filter((c) => c !== category));
    } else {
      onCategoriesChange([...categories, category]);
    }
  };

  const toggleStatus = (status: TaskStatusEnum) => {
    if (statuses.includes(status)) {
      onStatusesChange(statuses.filter((s) => s !== status));
    } else {
      onStatusesChange([...statuses, status]);
    }
  };

  const hasActiveFilters =
    priorities.length > 0 || categories.length > 0 || statuses.length > 0 || searchText.length > 0;
  const activeFilterCount =
    priorities.length + categories.length + statuses.length + (searchText ? 1 : 0);

  return (
    <Box sx={{ mb: 2 }}>
      {/* Compact Main Bar */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          p: 1,
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
        }}
      >
        {/* View Toggle */}
        <ToggleButtonGroup
          value={viewType}
          exclusive
          onChange={(_, value) => value && onViewChange(value)}
          size="small"
          sx={{ height: 32 }}
        >
          <ToggleButton value="kanban" sx={{ px: 1.5, py: 0.5 }}>
            <ViewKanbanIcon sx={{ fontSize: 18, mr: 0.5 }} />
            <Box component="span" sx={{ fontSize: '0.8rem' }}>
              Kanban
            </Box>
          </ToggleButton>
          <ToggleButton value="eisenhower" sx={{ px: 1.5, py: 0.5 }}>
            <GridViewIcon sx={{ fontSize: 18, mr: 0.5 }} />
            <Box component="span" sx={{ fontSize: '0.8rem' }}>
              Matrix
            </Box>
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Search */}
        <TextField
          size="small"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            flexGrow: 1,
            maxWidth: 300,
            '& .MuiInputBase-root': { height: 32, fontSize: '0.875rem' },
          }}
        />

        {/* Quick Priority Filters - Inline */}
        {Object.entries(PRIORITY_CONFIG).map(([priority, config]) => (
          <Chip
            key={priority}
            label={config.shortLabel}
            onClick={() => togglePriority(priority as TaskPriorityEnum)}
            color={priorities.includes(priority as TaskPriorityEnum) ? config.color : 'default'}
            variant={priorities.includes(priority as TaskPriorityEnum) ? 'filled' : 'outlined'}
            size="small"
            sx={{
              height: 24,
              fontSize: '0.7rem',
              fontWeight: priorities.includes(priority as TaskPriorityEnum) ? 600 : 400,
              minWidth: 36,
              '& .MuiChip-label': { px: 0.75 },
            }}
          />
        ))}

        {/* Status Filters - Available in Both Views */}
        {COLUMNS.map((column) => (
          <Chip
            key={column.status}
            label={column.title}
            onClick={() => toggleStatus(column.status)}
            variant={statuses.includes(column.status) ? 'filled' : 'outlined'}
            size="small"
            sx={{
              height: 24,
              fontSize: '0.7rem',
              fontWeight: statuses.includes(column.status) ? 600 : 400,
              bgcolor: statuses.includes(column.status) ? column.bgColor : 'transparent',
              color: statuses.includes(column.status) ? column.color : 'text.secondary',
              borderColor: column.color,
              '& .MuiChip-label': { px: 1 },
              '&:hover': {
                bgcolor: statuses.includes(column.status) ? column.bgColor : column.bgColor,
                opacity: 0.9,
              },
            }}
          />
        ))}

        {/* Expand Filters Button */}
        {availableCategories.length > 0 && (
          <Tooltip title={filtersExpanded ? 'Hide categories' : 'Show categories'}>
            <IconButton
              size="small"
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              sx={{
                bgcolor: filtersExpanded ? 'action.selected' : 'transparent',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <FilterListIcon sx={{ fontSize: 18 }} />
              {categories.length > 0 && (
                <Box
                  component="span"
                  sx={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    fontSize: '0.6rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {categories.length}
                </Box>
              )}
            </IconButton>
          </Tooltip>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Tooltip title={`Clear ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''}`}>
            <IconButton size="small" onClick={onClearFilters} color="error">
              <ClearIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      {/* Collapsible Category Filters */}
      {availableCategories.length > 0 && (
        <Collapse in={filtersExpanded}>
          <Box
            sx={{
              mt: 1,
              p: 1,
              bgcolor: 'background.paper',
              borderRadius: 1,
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {availableCategories.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  onClick={() => toggleCategory(category)}
                  color={categories.includes(category) ? 'primary' : 'default'}
                  variant={categories.includes(category) ? 'filled' : 'outlined'}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.7rem',
                    fontWeight: categories.includes(category) ? 600 : 400,
                    '& .MuiChip-label': { px: 1 },
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Collapse>
      )}
    </Box>
  );
}
