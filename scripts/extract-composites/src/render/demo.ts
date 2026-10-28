import { constants } from 'node:fs';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import type { FigmaNode } from '../model.ts';

export function renderDemo(componentName: string, snippet: string): string {
    const indented = snippet
        .trim()
        .split('\n')
        .map((line) => (line ? `            ${line}` : ''))
        .join('\n');
    return [
        `import { ${componentName} } from '@vapor-ui/composites';`,
        '',
        'export default function Demo() {',
        '    return (',
        indented,
        '    );',
        '}',
        '',
    ].join('\n');
}

export function findFirstInstance(root: FigmaNode): FigmaNode | undefined {
    for (const child of root.children ?? []) {
        if (child.type === 'INSTANCE') return child;
        const nested = findFirstInstance(child);
        if (nested) return nested;
    }
    return undefined;
}

/** `force`가 false이고 파일이 이미 있으면 쓰지 않는다. 손으로 작성한 demo를 재실행에서
 *  보존하기 위함. */
export async function writePlaceholder(
    absFile: string,
    baseName: string,
    nodeId: string,
    reason: string,
    force: boolean,
): Promise<void> {
    const content = [
        `// TODO(code-connect): ${reason} (figma node ${nodeId})`,
        `// name: ${baseName}`,
        '',
        'export default function Demo() {',
        '    return null;',
        '}',
        '',
    ].join('\n');
    await mkdir(dirname(absFile), { recursive: true });
    if (!force && (await exists(absFile))) return;
    await writeFile(absFile, content, 'utf8');
}

export async function exists(path: string): Promise<boolean> {
    try {
        await access(path, constants.F_OK);
        return true;
    } catch {
        return false;
    }
}
