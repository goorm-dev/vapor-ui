import { ExtractorError } from '#errors';
import type { ComponentDoc } from '#model';
import { type Lock, mirrorDoc } from '#translation';
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
 * Hand-written JSON that lives next to the generated files in `en/` and is never removed
 * as stale. `toast-object.json` documents the ToastOptions object used with
 * `useToastManager` (toast page), which has no component namespace to extract from.
 */
const HAND_WRITTEN_FILES = new Set(['toast-object.json']);

/**
 * The `api/` folder of the page that documents the component declared in
 * `sourceFile` (`…/components/<folder>/…`): `<pagesDir>/<page>/api`, next to the
 * page's `index.mdx`. `null` for a folder mapped to no page.
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

    const pageDir = path.join(pagesDir, page);

    if (!fs.existsSync(path.join(pageDir, 'index.mdx'))) {
        throw new ExtractorError(
            `No page for ${sourceFile}: ${pageDir}/index.mdx does not exist. ` +
                `Add the page, or map the component folder in PAGE_FOR_COMPONENT (src/write.ts).`,
        );
    }

    return path.join(pageDir, 'api');
}

function isExtractorOutput(filePath: string): boolean {
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return typeof data?.name === 'string' && Array.isArray(data.props);
    } catch {
        return false;
    }
}

/** `<api>/en/<file>` → `<api>/ko/<file>`. */
function koPathFor(enPath: string): string {
    return path.join(path.dirname(path.dirname(enPath)), 'ko', path.basename(enPath));
}

/**
 * Deletes extractor JSON in any `<page>/api/en/` folder under `pagesDir` that is not
 * in `keep`, with its `ko/` mirror, so a component that no longer exists doesn't
 * leave its files behind. Only files shaped like extractor output (`name` + `props[]`)
 * are removed.
 */
function removeStaleFiles(pagesDir: string, keep: string[]): string[] {
    const keepSet = new Set(keep);
    const stale = globSync('*/api/en/*.json', { cwd: pagesDir, absolute: true })
        .filter((filePath) => !HAND_WRITTEN_FILES.has(path.basename(filePath)))
        .filter((filePath) => !keepSet.has(filePath) && isExtractorOutput(filePath))
        .flatMap((filePath) => [filePath, koPathFor(filePath)])
        .filter((filePath) => fs.existsSync(filePath));
    // A ko/ file left without its en/ source, e.g. after a hand deletion.
    const orphans = globSync('*/api/ko/*.json', { cwd: pagesDir, absolute: true }).filter(
        (filePath) =>
            !fs.existsSync(
                path.join(path.dirname(path.dirname(filePath)), 'en', path.basename(filePath)),
            ),
    );
    stale.push(...orphans.filter((filePath) => !stale.includes(filePath)));

    for (const filePath of stale) fs.rmSync(filePath);

    return stale;
}

/**
 * Parses an existing file the ko/ mirror depends on. Throws instead of treating a
 * broken file as missing, which would silently replace its translations with English.
 */
function readTranslationFile(filePath: string, isValid: (data: unknown) => boolean): unknown {
    let data: unknown;
    try {
        data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new ExtractorError(`Cannot read ${filePath}: ${message}`);
    }
    if (!isValid(data)) throw new ExtractorError(`Unexpected shape in ${filePath}`);
    return data;
}

const isObject = (data: unknown) =>
    typeof data === 'object' && data !== null && !Array.isArray(data);

/** `<api>/ko.lock.json`, or `{}` when there is none. */
function readLock(apiDir: string): Lock {
    const lockPath = path.join(apiDir, 'ko.lock.json');
    return fs.existsSync(lockPath) ? (readTranslationFile(lockPath, isObject) as Lock) : {};
}

/** `<api>/ko/<file>`, or undefined when there is none yet. */
function readKoDoc(koPath: string): ComponentDoc | undefined {
    if (!fs.existsSync(koPath)) return undefined;
    return readTranslationFile(
        koPath,
        (data) => isObject(data) && Array.isArray((data as ComponentDoc).props),
    ) as ComponentDoc;
}

export interface ApiDirFile {
    /** File name without `.json`, the lock key. */
    name: string;
    en: ComponentDoc;
    /** The current `ko/` file, if there is one. */
    ko: ComponentDoc | undefined;
    koPath: string;
}

/**
 * Reads one page's `api/` folder: its lock, and every extractor-shaped `en/` file
 * (hand-written ones included) with its `ko/` counterpart. Shared with the
 * translate script so both read the folder by the same rules.
 */
export function readApiDir(apiDir: string): { lock: Lock; files: ApiDirFile[] } {
    const files = globSync('en/*.json', { cwd: apiDir, absolute: true })
        .sort()
        .filter(isExtractorOutput)
        .map((enPath) => {
            const koPath = koPathFor(enPath);
            return {
                name: path.basename(enPath, '.json'),
                en: JSON.parse(fs.readFileSync(enPath, 'utf8')) as ComponentDoc,
                ko: readKoDoc(koPath),
                koPath,
            };
        });
    return { lock: readLock(apiDir), files };
}

/**
 * Writes `<api>/ko/<file>` for every file readApiDir finds: the Korean text where
 * the lock says it matches the current source text, the English elsewhere (see mirrorDoc).
 */
function mirrorApiDir(apiDir: string): string[] {
    const { lock, files } = readApiDir(apiDir);

    return files.map(({ name, en, ko, koPath }) => {
        fs.mkdirSync(path.dirname(koPath), { recursive: true });
        fs.writeFileSync(koPath, JSON.stringify(mirrorDoc(en, ko, lock[name]), null, 2));
        return koPath;
    });
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
 * Writes one `en/<kebab-case name>.json` per doc into the `api/` folder of the page
 * that documents it (see findApiDir), skipping docs mapped to no page, then
 * rewrites the `ko/` mirror of every `api/` folder it wrote to. With `removeStale`,
 * also deletes extractor JSON this call didn't write — only safe when `docs` covers
 * every component.
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
            ? [{ doc, apiDir, filePath: path.join(apiDir, 'en', `${toKebabCase(doc.name)}.json`) }]
            : [];
    });

    const writtenEn = targets.map(({ doc, filePath }) => {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify(doc, null, 2));
        return filePath;
    });

    const removed = removeStale ? removeStaleFiles(root, writtenEn) : [];
    const writtenKo = [...new Set(targets.map(({ apiDir }) => apiDir))].flatMap(mirrorApiDir);

    return { written: [...writtenEn, ...writtenKo], removed };
}

/** Throws when prettier can't run; the caller decides whether that matters. */
export function formatWithPrettier(filePaths: string[]): void {
    if (filePaths.length === 0) return;
    execFileSync('npx', ['prettier', '--write', ...filePaths], { stdio: 'inherit' });
}
