import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import type { PropsInfoJson } from '~/models/output';

export interface WriteFile {
    filePath: string;
    content: string;
}

export function serializePropsInfo(data: PropsInfoJson): string {
    return JSON.stringify(data, null, 2);
}

export function buildWriteFiles(
    props: PropsInfoJson[],
    outputDir: string,
    toFileName: (prop: PropsInfoJson) => string,
): WriteFile[] {
    return props.map((prop) => ({
        filePath: path.join(outputDir, toFileName(prop)),
        content: serializePropsInfo(prop),
    }));
}

function ensureDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function formatWithPrettier(filePaths: string[]): void {
    if (filePaths.length === 0) return;

    try {
        execFileSync('npx', ['prettier', '--write', ...filePaths], { stdio: 'inherit' });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`Prettier formatting skipped: ${message}`);
    }
}

export function writePropsFiles(
    props: PropsInfoJson[],
    outputDir: string,
    toFileName: (prop: PropsInfoJson) => string,
): string[] {
    const writeFiles = buildWriteFiles(props, outputDir, toFileName);
    for (const writeFile of writeFiles) {
        ensureDirectory(path.dirname(writeFile.filePath));
        fs.writeFileSync(writeFile.filePath, writeFile.content);
    }
    const writtenFiles = writeFiles.map((f) => f.filePath);
    formatWithPrettier(writtenFiles);
    return writtenFiles;
}
