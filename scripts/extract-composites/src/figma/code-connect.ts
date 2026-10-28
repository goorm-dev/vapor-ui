import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import type { FigmaNode } from '../model.ts';
import { exists, findFirstInstance, renderDemo, writePlaceholder } from '../render/demo.ts';
import { fetchCodeConnectSnippet } from './claude-cli.ts';

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

/** Preview slot 하위 첫 INSTANCE의 Code Connect snippet을 받아 demo TSX로 쓰고 MDX-relative
 *  path를 반환한다. placeholder로 떨어지는 조건:
 *  - slot 밑에 INSTANCE가 없음
 *  - Code Connect snippet fetch 실패 또는 비어있음
 *  `force`가 false면 기존 파일은 보존해 손으로 쓴 demo를 덮어쓰지 않는다. */
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
