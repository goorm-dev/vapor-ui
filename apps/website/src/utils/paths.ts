/**
 * Base dir for relative `<Demo file>` paths. Lives here, not in `content-loader`, because importing
 * that module pulls every demo into the importer's bundle (its dynamic `import()` covers `content/docs`).
 */
const CONTENT_PATH = 'content/docs';

/**
 * Whether a `<Demo file>` path is rooted at `apps/website` (`/content/...`) rather than relative to
 * `content/docs`. `content-loader` assumes such a path always starts with `/content/`.
 */
export const isWebsiteRootPath = (file: string) => file.startsWith('/');

/** Resolve a `<Demo file>` path to a path relative to `apps/website`, e.g. `content/docs/foo.tsx`. */
export const resolveDemoFile = (file: string): string =>
    isWebsiteRootPath(file) ? file.slice(1) : `${CONTENT_PATH}/${file}`;
