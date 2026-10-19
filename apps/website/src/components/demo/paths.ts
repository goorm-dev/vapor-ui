/** Shared helpers for the Demo single-source-of-truth path contract.
 *
 *  Authors give the Demo component a `file` path that is absolute from the Next.js app
 *  root (`apps/website/`), for example:
 *      /content/docs/components/(components)/button/examples/default-button.tsx
 *  Any location is valid as long as it resolves inside `apps/website/`.
 *
 *  These helpers strip the leading slash so the same path can be fed to either:
 *    - a webpack/Turbopack dynamic `import()` template that climbs back to `apps/website/`
 *    - the `fumadocs-docgen` fileGenerator (expects `./content/...` relative to cwd)
 *    - the server-side LLM pipeline (`fs.readFileSync` on the resolved absolute path)
 */

/** Strip the leading `/` or `./` so the path is relative to `apps/website/`. */
export const normalizeFile = (file: string): string => file.replace(/^\.?\//, '');

/** Build the path form `fumadocs-docgen` and `replaceBlockDoc` expect. */
export const fileToDocGenPath = (file: string): string => `./${normalizeFile(file)}`;
