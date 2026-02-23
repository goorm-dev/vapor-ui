/**
 * tsconfig 탐색 모듈
 */
import fs from 'node:fs';
import path from 'node:path';

export function findTsconfig(startDir: string): string | null {
    let currentDir = path.resolve(startDir);

    while (currentDir !== path.dirname(currentDir)) {
        const tsconfigPath = path.join(currentDir, 'tsconfig.json');
        if (fs.existsSync(tsconfigPath)) {
            return tsconfigPath;
        }
        currentDir = path.dirname(currentDir);
    }

    return null;
}
