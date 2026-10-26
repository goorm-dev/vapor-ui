/**
 * Base dir for `<Demo file>` paths, relative to `apps/website`. Lives here, not in `content-loader`,
 * because importing that module pulls every demo into the importer's bundle (its dynamic `import()`
 * covers `content/docs`).
 */
export const CONTENT_PATH = 'content/docs';
