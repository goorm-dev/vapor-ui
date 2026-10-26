/** Strip the leading `/` or `./` so the path is relative to `apps/website/`. */
export const normalizeFile = (file: string): string => file.replace(/^\.?\//, '');

/** Build the path form `fumadocs-docgen` and `replaceBlockDoc` expect. */
export const fileToDocGenPath = (file: string): string => `./${normalizeFile(file)}`;

export const isAbsolutePath = (file: string) => file.startsWith('/');

/**
 * Base dir for relative `<Demo file>` paths. Lives here, not in `content-loader`, because importing
 * that module pulls every demo into the importer's bundle (its dynamic `import()` covers `content/docs`).
 */
export const CONTENT_PATH = 'content/docs';
