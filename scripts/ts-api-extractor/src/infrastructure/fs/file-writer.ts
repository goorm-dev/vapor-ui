import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { type Reporter, silentReporter } from '~/domain/reporter';

export interface WriteFile {
    filePath: string;
    content: string;
}

function ensureDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

/**
 * Writes already-serialized files. Deciding what the bytes look like belongs to
 * domain/output-format.ts, so this stays the only thing that touches the disk.
 */
export function writeFiles(files: WriteFile[]): string[] {
    for (const file of files) {
        ensureDirectory(path.dirname(file.filePath));
        fs.writeFileSync(file.filePath, file.content);
    }

    return files.map((file) => file.filePath);
}

export function formatWithPrettier(filePaths: string[], reporter: Reporter = silentReporter): void {
    if (filePaths.length === 0) return;

    try {
        execFileSync('npx', ['prettier', '--write', ...filePaths], { stdio: 'inherit' });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        reporter.warn(`Prettier formatting skipped: ${message}`);
    }
}
