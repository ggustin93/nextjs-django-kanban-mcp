/**
 * Error Boundary - Global error handling for the application
 *
 * Catches runtime errors and provides graceful recovery UI.
 * Must be a Client Component to use error boundaries.
 */
'use client';

import { useEffect } from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to error monitoring service (Sentry, LogRocket, etc.)
    console.error('Application error:', error);
  }, [error]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          gap: 2,
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main' }} />
        <Typography variant="h4" component="h1" fontWeight={600}>
          Something went wrong
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
          {error.message || 'An unexpected error occurred. Please try again.'}
        </Typography>
        {error.digest && (
          <Typography variant="caption" color="text.disabled">
            Error ID: {error.digest}
          </Typography>
        )}
        <Button variant="contained" onClick={reset} sx={{ mt: 2 }}>
          Try again
        </Button>
      </Box>
    </Container>
  );
}
