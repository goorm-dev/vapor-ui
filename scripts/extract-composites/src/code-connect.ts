import { constants } from 'node:fs';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import type { FigmaClient } from './figma.ts';
import type { FigmaNode } from './types.ts';

export interface PreviewResult {
    file: string; // relative to the component docs dir (e.g. "demos/examples-01.tsx")
    placeholder: boolean;
    nodeId: string;
}

export interface ExtractPreviewOptions {
    client: FigmaClient;
    previewSlot: FigmaNode;
    componentDir: string; // apps/website/content/docs/composites/(components)/<slug>
    baseName: string; // e.g. "examples-01"
    force: boolean;
    warnings: string[];
}

/** Pull Code Connect source for the first INSTANCE under `previewSlot`, write it to
 *  `<componentDir>/demos/<baseName>.tsx`, and return the MDX-relative path.
 *  - No instance under slot → placeholder.
 *  - Code Connect unregistered → placeholder + warning (R5a).
 *  - Existing file preserved unless `force` (S4c).
 *  - Source saved verbatim; no import synthesis (S2a). */
export async function extractPreview(opts: ExtractPreviewOptions): Promise<PreviewResult> {
    const { client, previewSlot, componentDir, baseName, force, warnings } = opts;
    const relFile = join('demos', `${baseName}.tsx`);
    const absFile = join(componentDir, relFile);
    const instance = findFirstInstance(previewSlot);
    if (!instance) {
        warnings.push(`preview slot has no component instance: ${previewSlot.id}`);
        await writePlaceholder(absFile, baseName, previewSlot.id, 'no instance', force);
        return { file: relFile, placeholder: true, nodeId: previewSlot.id };
    }
    const entries = await client.getCodeConnect(instance.id);
    const source = pickSource(entries);
    if (!source) {
        warnings.push(
            `Code Connect missing for instance ${instance.name} (${instance.id}); placeholder written`,
        );
        await writePlaceholder(absFile, baseName, instance.id, 'unregistered', force);
        return { file: relFile, placeholder: true, nodeId: instance.id };
    }
    await writeIfAllowed(absFile, source, force);
    return { file: relFile, placeholder: false, nodeId: instance.id };
}

function findFirstInstance(root: FigmaNode): FigmaNode | undefined {
    for (const child of root.children ?? []) {
        if (child.type === 'INSTANCE') return child;
        const nested = findFirstInstance(child);
        if (nested) return nested;
    }
    return undefined;
}

function pickSource(
    entries: Array<{ source?: string; template_data?: { template?: string } }>,
): string | undefined {
    for (const e of entries) {
        if (typeof e.source === 'string' && e.source.trim()) return e.source;
        const tmpl = e.template_data?.template;
        if (typeof tmpl === 'string' && tmpl.trim()) return tmpl;
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
    await writeIfAllowed(absFile, content, force);
}

async function writeIfAllowed(absFile: string, content: string, force: boolean): Promise<void> {
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
