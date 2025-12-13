/**
 * MarkdownText Component - Lightweight markdown renderer with checkbox support
 * Uses react-markdown + remark-gfm for GitHub Flavored Markdown
 *
 * Features:
 * - Interactive checkboxes (task lists) with callback
 * - Links open in new tab securely
 * - Compact styling for card descriptions
 *
 * Syntax shortcuts:
 * - Checkbox: "- [ ] task" or "- [x] done"
 * - Bold: **text**
 * - Italic: *text*
 * - Link: [text](url)
 * - Code: `code`
 */
'use client';

import { useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Box, Checkbox, Link, Typography } from '@mui/material';
import { Components } from 'react-markdown';

interface MarkdownTextProps {
  children: string;
  variant?: 'body2' | 'caption';
  onCheckboxChange?: (newContent: string) => void;
}

export function MarkdownText({
  children,
  variant = 'caption',
  onCheckboxChange,
}: MarkdownTextProps) {
  // Toggle checkbox in markdown content
  const handleCheckboxToggle = useCallback(
    (index: number, checked: boolean) => {
      if (!onCheckboxChange) return;

      // Find all checkboxes in content and toggle the one at index
      let checkboxCount = 0;
      const newContent = children.replace(/- \[([ xX])\]/g, (match) => {
        if (checkboxCount === index) {
          checkboxCount++;
          return checked ? '- [x]' : '- [ ]';
        }
        checkboxCount++;
        return match;
      });

      onCheckboxChange(newContent);
    },
    [children, onCheckboxChange]
  );

  // Track checkbox index for each render
  let checkboxIndex = 0;

  // Custom components to style markdown elements with MUI
  const components: Components = useMemo(
    () => ({
      // Paragraphs - no extra margin for compact display
      p: ({ children }) => (
        <Typography component="span" variant="inherit" sx={{ display: 'block', my: 0.25 }}>
          {children}
        </Typography>
      ),
      // Links - open in new tab securely
      a: ({ href, children }) => (
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: 'primary.main',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          {children}
        </Link>
      ),
      // Strong/Bold
      strong: ({ children }) => (
        <Box component="strong" sx={{ fontWeight: 600 }}>
          {children}
        </Box>
      ),
      // Emphasis/Italic
      em: ({ children }) => (
        <Box component="em" sx={{ fontStyle: 'italic' }}>
          {children}
        </Box>
      ),
      // Inline code
      code: ({ children }) => (
        <Box
          component="code"
          sx={{
            bgcolor: 'action.hover',
            px: 0.5,
            py: 0.125,
            borderRadius: 0.5,
            fontSize: '0.85em',
            fontFamily: 'monospace',
          }}
        >
          {children}
        </Box>
      ),
      // Lists - compact styling, remove bullet for task lists
      ul: ({ children, className }) => (
        <Box
          component="ul"
          sx={{
            my: 0.5,
            pl: className?.includes('contains-task-list') ? 0.5 : 2,
            listStyleType: className?.includes('contains-task-list') ? 'none' : 'disc',
          }}
        >
          {children}
        </Box>
      ),
      ol: ({ children }) => (
        <Box component="ol" sx={{ my: 0.5, pl: 2 }}>
          {children}
        </Box>
      ),
      li: ({ children, className }) => (
        <Box
          component="li"
          sx={{
            my: 0.125,
            display: className?.includes('task-list-item') ? 'flex' : 'list-item',
            alignItems: 'flex-start',
            listStyleType: className?.includes('task-list-item') ? 'none' : undefined,
          }}
        >
          {children}
        </Box>
      ),
      // Interactive checkboxes
      input: ({ type, checked, disabled, ...props }) => {
        if (type === 'checkbox') {
          const currentIndex = checkboxIndex++;
          return (
            <Checkbox
              size="small"
              checked={!!checked}
              disabled={!onCheckboxChange}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                handleCheckboxToggle(currentIndex, e.target.checked);
              }}
              sx={{
                p: 0.5,
                mr: 0.5,
                mt: 0,
                minWidth: 24,
                minHeight: 24,
                '& .MuiSvgIcon-root': { fontSize: 16 },
                '&:hover': {
                  bgcolor: 'action.hover',
                  borderRadius: 0.5,
                },
                transition: 'background-color 0.15s ease-in-out',
              }}
            />
          );
        }
        return <input type={type} checked={checked} disabled={disabled} {...props} />;
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }),
    [onCheckboxChange, handleCheckboxToggle]
  );

  // Reset checkbox index on each render
  checkboxIndex = 0;

  return (
    <Typography
      component="div"
      variant={variant}
      sx={{
        '& > *:first-of-type': { mt: 0 },
        '& > *:last-child': { mb: 0 },
        lineHeight: 1.5,
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </Typography>
  );
}
