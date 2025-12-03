/**
 * Material UI Theme Configuration
 * ===============================
 *
 * Purpose: Consistent colors, typography, and component styles
 */
'use client';

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3b82f6', // Modern blue
      light: '#60a5fa',
      dark: '#2563eb',
    },
    secondary: {
      main: '#8b5cf6', // Modern purple
      light: '#a78bfa',
      dark: '#7c3aed',
    },
    background: {
      default: '#f8fafc', // Subtle gray
      paper: '#ffffff',
    },
    info: {
      main: '#3b82f6', // To Do - blue
    },
    warning: {
      main: '#f59e0b', // Doing - orange
    },
    success: {
      main: '#10b981', // Done - green
    },
    error: {
      main: '#ef4444', // P1 - red
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: '"DM Sans", "Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h3: {
      fontWeight: 800,
      letterSpacing: '-0.03em',
      fontSize: '2rem',
    },
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.025em',
      fontSize: '1.75rem',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    subtitle1: {
      fontWeight: 500,
      lineHeight: 1.4,
    },
    subtitle2: {
      fontWeight: 600,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
      fontSize: '0.75rem',
    },
    body1: {
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      lineHeight: 1.5,
      fontWeight: 400,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
          transition: 'box-shadow 0.2s, transform 0.2s',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});
