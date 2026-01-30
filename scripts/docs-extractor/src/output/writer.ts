import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import type { PropsInfo } from '~/types/props';

export interface WriteOptions {
    format?: boolean;
}

export function ensureDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

export function writeJsonFile(filePath: string, data: PropsInfo, _options: WriteOptions = {}): void {
    ensureDirectory(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function writeMultipleFiles(
    props: PropsInfo[],
    outputDir: string,
    toFileName: (prop: PropsInfo) => string,
    _options: WriteOptions = {},
): string[] {
    ensureDirectory(outputDir);

    const writtenFiles: string[] = [];

    for (const prop of props) {
        const fileName = toFileName(prop);
        const filePath = path.join(outputDir, fileName);
        writeJsonFile(filePath, prop);
        writtenFiles.push(filePath);
    }

    return writtenFiles;
}

export function formatWithPrettier(filePaths: string[]): void {
    if (filePaths.length === 0) return;
    try {
        execSync(`npx prettier --write ${filePaths.join(' ')}`, { stdio: 'inherit' });
    } catch {
        // prettier not available, skip formatting
    }
}
