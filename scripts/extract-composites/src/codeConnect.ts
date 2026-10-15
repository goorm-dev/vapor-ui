import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import type { FigmaClient } from './figma.ts';

export interface CodeConnectResult {
    code: string | null;
    codeLabel: string;
}

export async function fetchAndSaveCodeConnect(
    client: FigmaClient,
    nodeId: string,
    outputDir: string,
    baseName: string,
    label: string,
    warnings: string[],
): Promise<CodeConnectResult> {
    const entries = await client.getCodeConnect(nodeId);
    const match = entries.find((e) => e.label?.toLowerCase() === label.toLowerCase());
    if (!match) {
        warnings.push(`Code Connect missing for ${nodeId} (label=${label})`);
        return { code: null, codeLabel: label };
    }
    const source = match.source ?? match.template_data?.template;
    if (!source) {
        warnings.push(`Code Connect ${nodeId} has no source (label=${label})`);
        return { code: null, codeLabel: label };
    }
    const rel = join('examples', `${baseName}.tsx`);
    const abs = join(outputDir, rel);
    await mkdir(dirname(abs), { recursive: true });
    await writeFile(abs, source);
    return { code: rel, codeLabel: label };
}
