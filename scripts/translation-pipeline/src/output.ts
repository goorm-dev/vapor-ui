import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import type { TranslatableDoc } from '~/domain';
import type { InputDoc } from '~/input';
import { errorMessage } from '~/util';

interface OutputFile {
    fileName: string;
    content: Record<string, unknown>;
}

export function applyTranslationsToRaw(
    rawDocs: Pick<InputDoc, 'raw' | 'fileName'>[],
    translatedDocs: TranslatableDoc[],
): OutputFile[] {
    return rawDocs.map((entry, index) => {
        const translation = translatedDocs[index];
        if (!translation) {
            return { fileName: entry.fileName, content: entry.raw };
        }
        const merged: Record<string, unknown> = { ...entry.raw };
        if (translation.description !== undefined) {
            merged['description'] = translation.description;
        }
        const originalProps = Array.isArray(entry.raw['props']) ? entry.raw['props'] : [];
        merged['props'] = originalProps.map((prop, propIndex) => {
            if (typeof prop !== 'object' || prop === null) return prop;
            const translatedProp = translation.props[propIndex];
            if (!translatedProp) return prop;
            return {
                ...(prop as Record<string, unknown>),
                ...(translatedProp.description !== undefined
                    ? { description: translatedProp.description }
                    : {}),
            };
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
