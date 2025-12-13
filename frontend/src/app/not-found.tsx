/**
 * Not Found Page - Custom 404 error page
 *
 * Client Component required for MUI components.
 * Provides navigation back to home.
 */
'use client';

import Link from 'next/link';
import { Box, Button, Typography, Container } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';

export default function NotFound() {
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
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '6rem', md: '8rem' },
            fontWeight: 900,
            color: 'primary.main',
            lineHeight: 1,
          }}
        >
          404
        </Typography>
        <SearchOffIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
        <Typography variant="h5" fontWeight={600}>
          Page not found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </Typography>
        <Button component={Link} href="/" variant="contained" sx={{ mt: 2 }}>
          Back to home
        </Button>
      </Box>
    </Container>
  );
}
