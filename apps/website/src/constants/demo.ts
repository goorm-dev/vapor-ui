/**
 * Base dir for `<Demo file>` paths, relative to `apps/website`. The demo loaders (`Preview`,
 * `DynamicComponent`) write `~content/docs/` as a literal instead: the bundler can only scope a
 * dynamic `import()` from a literal prefix. Keep this file import-free: the LLM text routes import it.
 */
export const CONTENT_PATH = 'content/docs';
