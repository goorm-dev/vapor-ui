export const isAbsolutePath = (file: string) => file.startsWith('/');

/**
 * Base dir for relative `<Demo file>` paths. Lives here, not in `content-loader`, because importing
 * that module pulls every demo into the importer's bundle (its dynamic `import()` covers `content/docs`).
 */
export const CONTENT_PATH = 'content/docs';

/**
 * Resolve a `<Demo file>` value to a path relative to `apps/website/`: an absolute `file` starts
 * from `apps/website`, a relative one from `content/docs`. String-only so client code can import it.
 */
export const toWebsitePath = (file: string): string =>
    isAbsolutePath(file) ? file.slice(1) : `${CONTENT_PATH}/${file}`;
