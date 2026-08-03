import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import { makeUnitKey } from '~/domain';
import type { InputDoc } from '~/input';
import { errorMessage } from '~/util';

interface OutputFile {
    fileName: string;
    content: Record<string, unknown>;
}

export function applyTranslationsToRaw(
    inputDocs: Pick<InputDoc, 'raw' | 'fileName' | 'doc'>[],
    translations: Map<string, string>,
): OutputFile[] {
    return inputDocs.map((entry) => {
        const componentDisplayName = entry.doc.displayName;
        const merged: Record<string, unknown> = { ...entry.raw };

        const componentDescription = translations.get(makeUnitKey(componentDisplayName, null));
        if (componentDescription !== undefined) {
            merged['description'] = componentDescription;
        }

        const originalProps = Array.isArray(entry.raw['props']) ? entry.raw['props'] : [];
        merged['props'] = originalProps.map((prop) => {
            if (typeof prop !== 'object' || prop === null) return prop;
            const propName = (prop as Record<string, unknown>)['name'];
            if (typeof propName !== 'string') return prop;
            const translated = translations.get(makeUnitKey(componentDisplayName, propName));
            return translated === undefined
                ? prop
                : { ...(prop as Record<string, unknown>), description: translated };
        });

        return { fileName: entry.fileName, content: merged };
    });
}

export function writeKoFiles(outputDir: string, files: OutputFile[]): string[] {
    const koDir = join(outputDir, 'ko');
    mkdirSync(koDir, { recursive: true });
    const writtenFiles: string[] = [];
    for (const { fileName, content } of files) {
        const filePath = join(koDir, basename(fileName));
        writeFileSync(filePath, JSON.stringify(content, null, 4) + '\n', 'utf-8');
        writtenFiles.push(filePath);
    }
    return writtenFiles;
}

export function formatWithPrettier(filePaths: string[]): void {
    if (filePaths.length === 0) return;

    try {
        execFileSync('npx', ['prettier', '--write', ...filePaths], { stdio: 'inherit' });
    } catch (error) {
        console.warn(`Prettier formatting skipped: ${errorMessage(error)}`);
    }
}
