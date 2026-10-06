import { ExtractorError } from '#errors';
import { globSync } from 'glob';
import fs from 'node:fs';
import path from 'node:path';

function normalizeComponentName(name: string): string {
    return name.toLowerCase().replace(/-/g, '');
}

export function scanComponentFiles(inputPath: string, component?: string): string[] {
    if (!fs.existsSync(inputPath)) {
        throw new ExtractorError(`Path does not exist: ${inputPath}`);
    }

    const filesInStableOrder = globSync('**/*.tsx', {
        cwd: inputPath,
        absolute: true,
        ignore: ['**/*.stories.tsx', '**/*.test.tsx'],
    }).sort();

    if (filesInStableOrder.length === 0) {
        throw new ExtractorError('No .tsx files found in the specified path');
    }

    if (!component) return filesInStableOrder;

    const targetComponentName = normalizeComponentName(component);
    const matchedFile = filesInStableOrder.find(
        (candidate) =>
            normalizeComponentName(path.basename(candidate, '.tsx')) === targetComponentName,
    );

    if (!matchedFile) {
        const available = filesInStableOrder
            .map((candidate) => path.basename(candidate, '.tsx'))
            .join(', ');
        throw new ExtractorError(`Component '${component}' not found.\nAvailable: ${available}`);
    }

    return [matchedFile];
}
