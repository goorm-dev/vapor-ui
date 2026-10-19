/** Strip the leading `/` or `./` so the path is relative to `apps/website/`. */
export const normalizeFile = (file: string): string => file.replace(/^\.?\//, '');

/** Build the path form `fumadocs-docgen` and `replaceBlockDoc` expect. */
export const fileToDocGenPath = (file: string): string => `./${normalizeFile(file)}`;
