import { glob } from 'glob';

const DEFAULT_IGNORE = ['.stories.tsx', '.css.ts'];

export interface ScannerOptions {
    ignore?: string[];
    noDefaultIgnore?: boolean;
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
