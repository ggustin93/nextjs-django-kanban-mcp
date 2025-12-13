/**
 * Jest Mock for remark-gfm (ESM-only package)
 *
 * remark-gfm is an ESM-only package and Jest cannot parse it in CommonJS mode.
 * This mock provides a simple replacement for testing purposes.
 */

// remark-gfm is a remark plugin, so we export a no-op function
const remarkGfm = () => {
  // No-op plugin for testing
  return (tree: unknown) => tree;
};

export default remarkGfm;
