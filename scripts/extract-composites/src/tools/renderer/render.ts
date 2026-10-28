import { mkdir, rm } from 'node:fs/promises';
import { dirname } from 'node:path';

import type { NormalizedDoc } from '../normalizer/index.ts';
import { writeComponentMdx } from './io.ts';
import { renderMdx } from './mdx.ts';

export interface RenderOptions {
    contentFile: string;
    clean: boolean;
}

export interface RenderResult {
    mdxPath: string;
}

export async function render(doc: NormalizedDoc, opts: RenderOptions): Promise<RenderResult> {
    if (opts.clean) await rm(opts.contentFile, { force: true });
    await mkdir(dirname(opts.contentFile), { recursive: true });
    const mdx = renderMdx({
        slug: doc.slug,
        title: doc.docTitle,
        description: doc.docDescription,
        sections: doc.sections,
    });
    await writeComponentMdx(opts.contentFile, mdx);
    return { mdxPath: opts.contentFile };
}
