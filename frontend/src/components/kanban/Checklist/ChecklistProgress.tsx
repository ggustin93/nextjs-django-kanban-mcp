/**
 * ChecklistProgress - Visual progress indicator for checklist completion
 *
 * Features:
 * - Linear progress bar with percentage
 * - Color changes based on completion (primary -> success at 100%)
 * - Compact display with count
 */
'use client';

import { Box, LinearProgress, Typography } from '@mui/material';

interface ChecklistProgressProps {
  completed: number;
  total: number;
}

export function ChecklistProgress({ completed, total }: ChecklistProgressProps) {
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
  const isComplete = progress === 100;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          flex: 1,
          height: 6,
          borderRadius: 3,
          bgcolor: 'action.hover',
          '& .MuiLinearProgress-bar': {
            bgcolor: isComplete ? 'success.main' : 'primary.main',
            borderRadius: 3,
            transition: 'transform 0.3s ease-in-out, background-color 0.3s',
          },
        }}
      />
      <Typography
        variant="caption"
        sx={{
          color: isComplete ? 'success.main' : 'text.secondary',
          fontWeight: isComplete ? 600 : 400,
          minWidth: 36,
          textAlign: 'right',
        }}
      >
        {completed}/{total}
      </Typography>
    </Box>
  );
}
