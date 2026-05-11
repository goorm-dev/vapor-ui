import { glob } from 'glob';
import path from 'node:path';

const DEFAULT_EXCLUDES = ['.stories.tsx', '.css.ts', '.test.tsx'];

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
    const files = await glob('**/*.tsx', { cwd: inputPath, absolute: true });
    return files.filter((file) => !DEFAULT_EXCLUDES.some((pattern) => file.endsWith(pattern)));
}
