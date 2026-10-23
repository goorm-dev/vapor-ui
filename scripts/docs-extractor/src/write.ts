import { ExtractorError } from '#errors';
import type { ComponentDoc } from '#model';
import { globSync } from 'glob';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/** `AvatarRoot` → `avatar-root`, `HStack` → `h-stack`. */
function toKebabCase(str: string): string {
    return str
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .toLowerCase();
}

/**
 * Component folders documented on a page with another name, or (`null`) not
 * documented on a components page. Every other folder under `components/` is
 * documented on the page folder of the same name.
 */
const PAGE_FOR_COMPONENT: Record<string, string | null> = {
    // RadioGroup is documented on the Radio page.
    'radio-group': 'radio',
    // No page yet.
    'alert-dialog': null,
    // Documented under /theme, which has no props tables.
    'theme-provider': null,
};

/**
 * Hand-written JSON that lives next to the generated files and is never removed
 * as stale. `toast-object.json` documents the ToastOptions object used with
 * `useToastManager` (toast page), which has no component namespace to extract from.
 */
const HAND_WRITTEN_FILES = new Set(['toast-object.json']);

/** `(components)/avatar` → `avatar`: route groups `(…)` are not part of the page URL. */
function toSlug(pageDir: string): string {
    return pageDir
        .split(path.sep)
        .filter((segment) => !/^\(.+\)$/.test(segment))
        .join('/');
}

/**
 * The `api/` folder of the page that documents the component declared in
 * `sourceFile` (`…/components/<folder>/…`): `<pagesDir>/<page>/api`, next to the
 * page's `index.mdx`. The page is matched by URL slug, so it can sit in a route
 * group (`(components)/avatar`) but not in a real folder (`patterns/form` is not `form`).
 * `null` for a folder mapped to no page.
 *
 * Throws ExtractorError when the page doesn't exist, so a new component without
 * a page fails loudly instead of being written nowhere.
 */
export function findApiDir(sourceFile: string, pagesDir: string): string | null {
    const parts = path.resolve(sourceFile).split(path.sep);
    const at = parts.lastIndexOf('components');
    if (at === -1 || at + 2 >= parts.length) {
        throw new ExtractorError(`${sourceFile} is not in a components/<folder>/ directory`);
    }

    const folder = parts[at + 1];
    const page = folder in PAGE_FOR_COMPONENT ? PAGE_FOR_COMPONENT[folder] : folder;
    if (page === null) return null;

    const pageDir = globSync('**/index.mdx', { cwd: pagesDir })
        .map(path.dirname)
        .find((dir) => toSlug(dir) === page);

    if (!pageDir) {
        throw new ExtractorError(
            `No page for ${sourceFile}: no ${page}/index.mdx under ${pagesDir} (directly or in a route group). ` +
                `Add the page, or map the component folder in PAGE_FOR_COMPONENT (src/write.ts).`,
        );
    }

    return path.join(pagesDir, pageDir, 'api');
}

function isExtractorOutput(filePath: string): boolean {
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return typeof data?.name === 'string' && Array.isArray(data.props);
    } catch {
        return false;
    }
}

/**
 * Deletes extractor JSON in any `<page>/api/` folder under `pagesDir` that is not in
 * `keep`, so a component that no longer exists doesn't leave its file behind.
 * Only files shaped like extractor output (`name` + `props[]`) are removed.
 */
function removeStaleFiles(pagesDir: string, keep: string[]): string[] {
    const keepSet = new Set(keep);
    const stale = globSync('**/api/*.json', { cwd: pagesDir, absolute: true })
        .filter((filePath) => !HAND_WRITTEN_FILES.has(path.basename(filePath)))
        .filter((filePath) => !keepSet.has(filePath) && isExtractorOutput(filePath));

    for (const filePath of stale) fs.rmSync(filePath);

    return stale;
}

export interface WriteResult {
    written: string[];
    removed: string[];
}

export interface DocToWrite {
    doc: ComponentDoc;
    /** The `.tsx` file the doc was extracted from. Decides the page folder. */
    sourceFile: string;
}

/**
 * Writes one `<kebab-case name>.json` per doc into the `api/` folder of the page
 * that documents it (see findApiDir), skipping docs mapped to no page. With `removeStale`, also deletes extractor
 * JSON this call didn't write — only safe when `docs` covers every component.
 */
export function writeDocs(
    pagesDir: string,
    docs: DocToWrite[],
    { removeStale = false }: { removeStale?: boolean } = {},
): WriteResult {
    const root = path.resolve(pagesDir);
    const targets = docs.flatMap(({ doc, sourceFile }) => {
        const apiDir = findApiDir(sourceFile, root);
        return apiDir
            ? [{ doc, filePath: path.join(apiDir, `${toKebabCase(doc.name)}.json`) }]
            : [];
    });

    const written = targets.map(({ doc, filePath }) => {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify(doc, null, 2));
        return filePath;
    });

    return { written, removed: removeStale ? removeStaleFiles(root, written) : [] };
}

/** Throws when prettier can't run; the caller decides whether that matters. */
export function formatWithPrettier(filePaths: string[]): void {
    if (filePaths.length === 0) return;
    execFileSync('npx', ['prettier', '--write', ...filePaths], { stdio: 'inherit' });
}
