import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

import type { FigmaClient } from './figma.ts';

export async function downloadWebpImages(
    client: FigmaClient,
    fileKey: string,
    jobs: Array<{ nodeId: string; baseName: string }>,
    outputDir: string,
): Promise<Record<string, string>> {
    if (jobs.length === 0) return {};
    const ids = jobs.map((j) => j.nodeId);
    const urls = await client.getImageUrls(fileKey, ids, 2, 'png');
    const out: Record<string, string> = {};
    for (const job of jobs) {
        const url = urls[job.nodeId];
        if (!url) continue;
        const res = await fetch(url);
        if (!res.ok) continue;
        const png = Buffer.from(await res.arrayBuffer());
        const webpRel = join('images', `${job.baseName}.webp`);
        const webpAbs = join(outputDir, webpRel);
        await mkdir(dirname(webpAbs), { recursive: true });
        await sharp(png).webp({ quality: 80 }).toFile(webpAbs);
        out[job.nodeId] = webpRel;
    }
    return out;
}
