import { ExtractorError } from '#errors';
import { globSync } from 'glob';
import fs from 'node:fs';
import path from 'node:path';

const EXCLUDED_SUFFIXES = ['.stories.tsx', '.test.tsx'];

/** `Button`, `button` and `button-group` vs `ButtonGroup` compare equal. */
function normalizeComponentName(name: string): string {
    return name.toLowerCase().replace(/-/g, '');
}

/**
 * The component files under `inputPath`, or just the one whose file name
 * matches `component`.
 */
export function scanComponentFiles(inputPath: string, component?: string): string[] {
    if (!fs.existsSync(inputPath)) {
        throw new ExtractorError(`Path does not exist: ${inputPath}`);
    }

    // glob resolves directories concurrently, so its order varies between runs.
    // File order decides the order TypeScript instantiates types, which decides how
    // it prints the members of shared literal unions — so an unsorted list makes the
    // extracted JSON differ run to run. Sort to keep extraction reproducible.
    const files = globSync('**/*.tsx', { cwd: inputPath, absolute: true })
        .sort()
        .filter((file) => !EXCLUDED_SUFFIXES.some((suffix) => file.endsWith(suffix)));

    if (files.length === 0) {
        throw new ExtractorError('No .tsx files found in the specified path');
    }

    if (!component) return files;

    const wanted = normalizeComponentName(component);
    const file = files.find(
        (candidate) => normalizeComponentName(path.basename(candidate, '.tsx')) === wanted,
    );

    if (!file) {
        const available = files.map((candidate) => path.basename(candidate, '.tsx')).join(', ');
        throw new ExtractorError(`Component '${component}' not found.\nAvailable: ${available}`);
    }

    return [file];
}
