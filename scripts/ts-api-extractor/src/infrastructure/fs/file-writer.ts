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

/**
 * 이번 추출로 쓰이지 않은 기존 산출물을 지운다.
 *
 * 덮어쓰기만 하면 삭제된 컴포넌트의 문서가 그대로 남아 CI의 산출물 대조를
 * 통과해 버린다. 전체 추출일 때만 부른다 — `--component`로 하나만 뽑을 때
 * 지우면 나머지가 전부 날아간다.
 */
export function pruneStaleFiles(
    outputDir: string,
    writtenFiles: string[],
    extension: string,
    reporter: Reporter = silentReporter,
): string[] {
    if (!fs.existsSync(outputDir)) return [];

    const kept = new Set(writtenFiles.map((filePath) => path.basename(filePath)));
    const removed = fs
        .readdirSync(outputDir)
        .filter((file) => file.endsWith(extension) && !kept.has(file));

    for (const file of removed) fs.rmSync(path.join(outputDir, file));

    if (removed.length > 0) reporter.info(`Removed ${removed.length} stale files.`);

    return removed;
}
