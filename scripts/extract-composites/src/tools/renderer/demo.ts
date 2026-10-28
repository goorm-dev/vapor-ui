import { constants } from 'node:fs';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import type { FigmaNode } from '../../shared/types.ts';

/** Serialize a Code Connect snippet into a demo TSX module ready for `<Demo file="…" />`. */
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

/** DFS the first INSTANCE descendant of `root`.
 *  Used to locate the component instance under a Preview slot. */
export function findFirstInstance(root: FigmaNode): FigmaNode | undefined {
    for (const child of root.children ?? []) {
        if (child.type === 'INSTANCE') return child;
        const nested = findFirstInstance(child);
        if (nested) return nested;
    }
    return undefined;
}

/** Write a placeholder demo file when the real Code Connect snippet is unavailable.
 *  Respects `force`: skips write if the file already exists and `force` is false,
 *  so a hand-authored demo is preserved across re-runs. */
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
