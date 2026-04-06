import path from 'node:path';

import type { PropsInfoJson } from '~/models/json';

export interface WriteFile {
    filePath: string;
    content: string;
}

export function ensureDirectoryPaths(outputDir: string, languages: string[]): string[] {
    return languages.map((language) => path.join(outputDir, language));
}

export function serializePropsInfo(data: PropsInfoJson): string {
    return JSON.stringify(data, null, 2);
}

export function buildWriteFiles(
    props: PropsInfoJson[],
    outputDir: string,
    languages: string[],
    toFileName: (prop: PropsInfoJson) => string,
): WriteFile[] {
    const files: WriteFile[] = [];

    for (const language of languages) {
        const languageOutputDir = path.join(outputDir, language);

        for (const prop of props) {
            files.push({
                filePath: path.join(languageOutputDir, toFileName(prop)),
                content: serializePropsInfo(prop),
            });
        }
    }

    return files;
}
