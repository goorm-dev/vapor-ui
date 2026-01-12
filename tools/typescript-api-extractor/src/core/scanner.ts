import { glob } from 'glob';
import path from 'node:path';

const DEFAULT_IGNORE = ['.stories.tsx', '.css.ts'];

export interface ScannerOptions {
    ignore?: string[];
    noDefaultIgnore?: boolean;
}

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

export async function findComponentFiles(
    inputPath: string,
    options?: ScannerOptions,
): Promise<string[]> {
    const files = await glob('**/*.tsx', { cwd: inputPath, absolute: true });

    const defaultPatterns = options?.noDefaultIgnore ? [] : DEFAULT_IGNORE;
    const customPatterns = options?.ignore ?? [];
    const ignorePatterns = [...defaultPatterns, ...customPatterns];

    if (ignorePatterns.length === 0) {
        return files;
    }

    return files.filter((file) => !ignorePatterns.some((pattern) => file.endsWith(pattern)));
}
