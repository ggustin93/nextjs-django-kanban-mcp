/**
 * Jest Mock for react-markdown (ESM-only package)
 *
 * react-markdown v10+ is ESM-only and Jest cannot parse it in CommonJS mode.
 * This mock provides a simple functional replacement for testing purposes.
 */
import React from 'react';

interface ReactMarkdownProps {
  children: string;
  remarkPlugins?: unknown[];
  components?: Record<string, React.ComponentType<unknown>>;
}

const ReactMarkdown: React.FC<ReactMarkdownProps> = ({ children }) => {
  // Simple mock - just render the markdown as plain text in a div
  // This is sufficient for unit tests that don't verify markdown rendering
  return <div data-testid="react-markdown">{children}</div>;
};

export default ReactMarkdown;
