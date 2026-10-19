/** Repo-relative path to the Demo examples directory. Single source of truth so Preview,
 *  Code-tab generation and the standalone preview route all resolve the same file. */
export const EXAMPLES_DIR = 'src/components/demo/examples';

/** Strip a leading `./` and the `.tsx` extension so the result can feed a dynamic import,
 *  e.g. `./button/default-button.tsx` → `button/default-button`. */
export const fileToComponentPath = (file: string): string =>
    file.replace(/^\.\//, '').replace(/\.tsx?$/, '');

/** Build the repo-relative path that `fumadocs-docgen` resolves for the Code tab block. */
export const fileToDocGenPath = (file: string): string =>
    `./${EXAMPLES_DIR}/${fileToComponentPath(file)}.tsx`;
