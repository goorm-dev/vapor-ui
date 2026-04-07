import { glob } from 'glob';
import path from 'node:path';

const DEFAULT_EXCLUDES = ['.stories.tsx', '.css.ts', '.test.tsx'];

export interface ScannerOptions {
    exclude?: string[];
    skipDefaultExcludes?: boolean;
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

    const defaultPatterns = options?.skipDefaultExcludes ? [] : DEFAULT_EXCLUDES;
    const customPatterns = options?.exclude ?? [];
    const excludePatterns = [...defaultPatterns, ...customPatterns];

    if (excludePatterns.length === 0) {
        return files;
    }

    return files.filter((file) => !excludePatterns.some((pattern) => file.endsWith(pattern)));
}
