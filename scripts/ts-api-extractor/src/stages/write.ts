import fs from 'node:fs';
import path from 'node:path';

import type { PropsInfoJson } from '~/models/output';

export interface WriteFile {
    filePath: string;
    content: string;
}

/**
 * 추출과 번역이 공유하는 유일한 직렬화 정의.
 *
 * 산출물은 커밋되고 CI가 재생성 결과와 대조하므로 포맷이 흔들리면 전 파일이
 * diff로 뜬다. prettier에 맡기지 않는 이유가 이것이다 — `.prettierignore`가
 * `public`을 무시해 실제 출력 경로에서는 적용되지 않고, 다른 경로에서는
 * 리포 설정을 못 찾아 기본값으로 포맷한다.
 */
export function serializePropsInfo(data: PropsInfoJson): string {
    return JSON.stringify(data, null, 4) + '\n';
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

/**
 * 이번 추출로 쓰이지 않은 기존 JSON을 지운다.
 *
 * 덮어쓰기만 하면 삭제된 컴포넌트의 문서가 그대로 남아 CI의 산출물 대조를
 * 통과해 버린다. 전체 추출일 때만 부른다 — `--component`로 하나만 뽑을 때
 * 지우면 나머지가 전부 날아간다.
 */
function pruneStaleFiles(outputDir: string, writtenFiles: string[]): string[] {
    if (!fs.existsSync(outputDir)) return [];

    const kept = new Set(writtenFiles.map((filePath) => path.basename(filePath)));
    const removed = fs
        .readdirSync(outputDir)
        .filter((file) => file.endsWith('.json') && !kept.has(file));

    for (const file of removed) fs.rmSync(path.join(outputDir, file));

    return removed;
}

export function writePropsFiles(
    props: PropsInfoJson[],
    outputDir: string,
    toFileName: (prop: PropsInfoJson) => string,
    { prune = false }: { prune?: boolean } = {},
): string[] {
    const writeFiles = buildWriteFiles(props, outputDir, toFileName);
    for (const writeFile of writeFiles) {
        ensureDirectory(path.dirname(writeFile.filePath));
        fs.writeFileSync(writeFile.filePath, writeFile.content);
    }

    const writtenFiles = writeFiles.map((f) => f.filePath);

    if (prune) {
        const removed = pruneStaleFiles(outputDir, writtenFiles);
        if (removed.length > 0) console.error(`Removed ${removed.length} stale files.`);
    }

    return writtenFiles;
}
