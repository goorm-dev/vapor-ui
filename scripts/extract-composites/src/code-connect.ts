import { constants } from 'node:fs';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { fetchCodeConnectSnippet } from './claude-cli.ts';
import type { FigmaNode } from './shared/types.ts';

export interface PreviewResult {
    file: string; // docs-root-relative path for <Demo file=""> (e.g. "composites/(components)/alert-dialog/demos/examples-01.tsx")
    placeholder: boolean;
    nodeId: string;
}

export interface ExtractPreviewOptions {
    fileKey: string;
    previewSlot: FigmaNode;
    componentDir: string; // apps/website/content/docs/composites/(components)/<slug>
    baseName: string; // e.g. "examples-01"
    demoRef: string; // what goes into `<Demo file="…" />` — docs-root-relative, with .tsx extension
    force: boolean;
    warnings: string[];
}

/**
 * Pull the Code Connect snippet for the first INSTANCE under `previewSlot`
 * (the Preview slot → Container frame → component instance structure used in
 * Figma), wrap it in a demo TSX module, and write it to
 * `<componentDir>/demos/<baseName>.tsx`. Returns the MDX-relative path.
 *
 * - No instance under slot → placeholder.
 * - Code Connect fetch fails or snippet empty → placeholder + warning.
 * - Existing file preserved unless `force`.
 *
 * Resolution runs through a headless Claude CLI subprocess, which calls the
 * Figma MCP tool `get_design_context` under the user's existing MCP connection
 * and extracts the JSX inside the `<CodeConnectSnippet>` tag.
 */
export async function extractPreview(opts: ExtractPreviewOptions): Promise<PreviewResult> {
    const { fileKey, previewSlot, componentDir, baseName, demoRef, force, warnings } = opts;
    const absFile = join(componentDir, 'demos', `${baseName}.tsx`);

    const instance = findFirstInstance(previewSlot);
    if (!instance) {
        warnings.push(`preview slot has no component instance: ${previewSlot.id}`);
        await writePlaceholder(absFile, baseName, previewSlot.id, 'no instance', force);
        return { file: demoRef, placeholder: true, nodeId: previewSlot.id };
    }

    if (!force && (await exists(absFile))) {
        return { file: demoRef, placeholder: false, nodeId: instance.id };
    }

    const result = await fetchCodeConnectSnippet(fileKey, instance.id);
    if (!result) {
        warnings.push(
            `Code Connect missing for instance ${instance.name} (${instance.id}); placeholder written`,
        );
        await writePlaceholder(absFile, baseName, instance.id, 'unregistered', force);
        return { file: demoRef, placeholder: true, nodeId: instance.id };
    }

    const content = renderDemo(result.componentName, result.snippet);
    await mkdir(dirname(absFile), { recursive: true });
    await writeFile(absFile, content, 'utf8');
    return { file: demoRef, placeholder: false, nodeId: instance.id };
}

function renderDemo(componentName: string, snippet: string): string {
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

function findFirstInstance(root: FigmaNode): FigmaNode | undefined {
    for (const child of root.children ?? []) {
        if (child.type === 'INSTANCE') return child;
        const nested = findFirstInstance(child);
        if (nested) return nested;
    }
    return undefined;
}

async function writePlaceholder(
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

async function exists(path: string): Promise<boolean> {
    try {
        await access(path, constants.F_OK);
        return true;
    } catch {
        return false;
    }
}
