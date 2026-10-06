import type { ComponentDoc } from '#model';
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

function isExtractorOutput(filePath: string): boolean {
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return typeof data?.name === 'string' && Array.isArray(data.props);
    } catch {
        return false;
    }
}

/**
 * Deletes extractor JSON in `dir` that is not in `keep`, so a component that no
 * longer exists doesn't leave its file behind. Only files shaped like extractor
 * output (`name` + `props[]`) are removed, so pointing --out at the wrong folder
 * can't delete something like package.json.
 */
function removeStaleFiles(dir: string, keep: string[]): string[] {
    const keepSet = new Set(keep);
    const stale = fs
        .readdirSync(dir)
        .filter((name) => name.endsWith('.json'))
        .map((name) => path.resolve(dir, name))
        .filter((filePath) => !keepSet.has(filePath) && isExtractorOutput(filePath));

    for (const filePath of stale) fs.rmSync(filePath);

    return stale;
}

export interface WriteResult {
    written: string[];
    removed: string[];
}

/**
 * Writes one `<kebab-case name>.json` per doc into `outputDir`. With
 * `removeStale`, also deletes extractor JSON this call didn't write — only safe
 * when `docs` covers every component.
 */
export function writeDocs(
    outputDir: string,
    docs: ComponentDoc[],
    { removeStale = false }: { removeStale?: boolean } = {},
): WriteResult {
    const dir = path.resolve(outputDir);
    fs.mkdirSync(dir, { recursive: true });

    const written = docs.map((doc) => {
        const filePath = path.join(dir, `${toKebabCase(doc.name)}.json`);
        fs.writeFileSync(filePath, JSON.stringify(doc, null, 2));
        return filePath;
    });

    return { written, removed: removeStale ? removeStaleFiles(dir, written) : [] };
}

/** Throws when prettier can't run; the caller decides whether that matters. */
export function formatWithPrettier(filePaths: string[]): void {
    if (filePaths.length === 0) return;
    execFileSync('npx', ['prettier', '--write', ...filePaths], { stdio: 'inherit' });
}
