import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { type Reporter, silentReporter } from '#domain/reporter';

export interface WriteFile {
    filePath: string;
    content: string;
}

function ensureDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

/**
 * Writes already-serialized files. Deciding what the bytes look like belongs to
 * domain/output-format.ts, so this stays the only thing that touches the disk.
 */
export function writeFiles(files: WriteFile[]): string[] {
    for (const file of files) {
        ensureDirectory(path.dirname(file.filePath));
        fs.writeFileSync(file.filePath, file.content);
    }

    return files.map((file) => file.filePath);
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
 * Deletes extractor JSON in `dir` that this run didn't write, so a component
 * that no longer exists doesn't leave its file behind. Only files shaped like
 * extractor output (`name` + `props[]`) are removed, so pointing outputDir at
 * the wrong folder can't delete something like package.json.
 */
export function removeStaleFiles(dir: string, keep: string[]): string[] {
    if (!fs.existsSync(dir)) return [];

    const keepSet = new Set(keep.map((filePath) => path.resolve(filePath)));
    const stale = fs
        .readdirSync(dir)
        .filter((name) => name.endsWith('.json'))
        .map((name) => path.resolve(dir, name))
        .filter((filePath) => !keepSet.has(filePath) && isExtractorOutput(filePath));

    for (const filePath of stale) fs.rmSync(filePath);

    return stale;
}

export function formatWithPrettier(filePaths: string[], reporter: Reporter = silentReporter): void {
    if (filePaths.length === 0) return;

    try {
        execFileSync('npx', ['prettier', '--write', ...filePaths], { stdio: 'inherit' });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        reporter.warn(`Prettier formatting skipped: ${message}`);
    }
}
