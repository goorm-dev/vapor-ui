import { ExtractorError } from '#domain/errors';
import { glob } from 'glob';
import fs from 'node:fs';
import path from 'node:path';

const EXCLUDED_SUFFIXES = ['.stories.tsx', '.test.tsx'];

export function normalizeComponentName(name: string): string {
    return name.toLowerCase().replace(/-/g, '');
}

export function findFileByComponentName(files: string[], componentName: string): string | null {
    const normalizedInput = normalizeComponentName(componentName);

    return (
        files.find((file) => {
            const fileName = path.basename(file, path.extname(file));
            return normalizeComponentName(fileName) === normalizedInput;
        }) ?? null
    );
}

export async function findComponentFiles(inputPath: string): Promise<string[]> {
    // glob resolves directories concurrently, so its order varies between runs.
    // File order decides the order TypeScript instantiates types, which decides how
    // it prints the members of shared literal unions — so an unsorted list makes the
    // extracted JSON differ run to run. Sort to keep extraction reproducible.
    const files = (await glob('**/*.tsx', { cwd: inputPath, absolute: true })).sort();

    return files.filter((file) => !EXCLUDED_SUFFIXES.some((suffix) => file.endsWith(suffix)));
}

/**
 * Turn the input directory (plus an optional --component filter) into the list
 * of files to parse. Owns every filesystem touch the CLI would otherwise do.
 */
export async function resolveTargetFiles(
    inputPath: string,
    componentName?: string,
): Promise<string[]> {
    if (!fs.existsSync(inputPath)) {
        throw new ExtractorError(`Path does not exist: ${inputPath}`);
    }

    const files = await findComponentFiles(inputPath);

    if (files.length === 0) {
        throw new ExtractorError('No .tsx files found in the specified path');
    }

    if (!componentName) return files;

    const file = findFileByComponentName(files, componentName);

    if (!file) {
        const available = files.map((f) => path.basename(f, '.tsx')).join(', ');
        throw new ExtractorError(
            `Component '${componentName}' not found.\nAvailable: ${available}`,
        );
    }

    return [file];
}
