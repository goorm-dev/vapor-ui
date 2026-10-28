import type { FigmaClient } from '../../clients/figma.ts';
import { findExportFrame, findTextByName } from '../../items.ts';
import { SLOT_NAMES, TEXT_NAMES } from '../../shared/constants.ts';
import type { FigmaNode, ItemBlock, Section } from '../../shared/types.ts';
import { SECTION_WHITELIST } from '../../shared/types.ts';
import { downloadWebpImages } from '../extractor/images.ts';

export interface BuildCaseBlockOptions {
    client: FigmaClient;
    fileKey: string;
    caseFrame: FigmaNode;
    variant: 'do' | 'dont';
    baseName: string;
    publicDir: string;
    warnings: string[];
    locator: string;
}

export async function buildCaseBlock(
    opts: BuildCaseBlockOptions,
): Promise<Extract<ItemBlock, { kind: 'doCase' | 'dontCase' }> | undefined> {
    const caption = findTextByName(opts.caseFrame, TEXT_NAMES.caption) ?? '';
    if (!caption) opts.warnings.push(`${opts.locator}: caption TEXT missing`);
    const target = pickCaseImageTarget(opts.caseFrame, opts.warnings, opts.locator);
    const webpRel = await downloadWebpImages(
        opts.client,
        opts.fileKey,
        [{ nodeId: target.id, baseName: opts.baseName }],
        opts.publicDir,
    );
    const rel = webpRel[target.id];
    if (!rel) {
        opts.warnings.push(`${opts.locator}: image export failed (${target.id})`);
        return undefined;
    }
    return {
        kind: opts.variant === 'do' ? 'doCase' : 'dontCase',
        webpRel: rel,
        alt: caption,
        caption,
    };
}

/** Prefer the Export frame inside the case's Sample slot (DFS so wrappers like
 *  `Container` don't hide it), fall back to the Sample slot, then the case frame
 *  itself. Each fallback is surfaced as a warning so silent mis-captures stop. */
function pickCaseImageTarget(caseFrame: FigmaNode, warnings: string[], locator: string): FigmaNode {
    const sample = (caseFrame.children ?? []).find((c) => c.name === SLOT_NAMES.sample);
    if (!sample) {
        warnings.push(
            `${locator}: Sample slot missing, used case frame fallback (${caseFrame.id})`,
        );
        return caseFrame;
    }
    const exportFrame = findExportFrame(sample);
    if (!exportFrame) {
        warnings.push(`${locator}: Export frame missing, used Sample fallback (${sample.id})`);
        return sample;
    }
    return exportFrame;
}

export function sortByPolicy(sections: Section[]): Section[] {
    const map = new Map(sections.map((s) => [s.title, s]));
    const out: Section[] = [];
    for (const title of SECTION_WHITELIST) {
        const s = map.get(title);
        if (s) out.push(s);
    }
    return out;
}
