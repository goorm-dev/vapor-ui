import { SLOT_NAMES, TEXT_NAMES } from '../constants.ts';
import type { FigmaClient } from '../figma/client.ts';
import { downloadWebpImages } from '../figma/images.ts';
import type { FigmaNode, ItemBlock } from '../model.ts';
import { findExportFrame, findTextByName } from '../traverse.ts';

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

/** Sample slot 안의 Export frame을 우선 쓰고 (Container 같은 wrapper에 가려지는 걸 대비해 DFS),
 *  없으면 Sample slot, 그다음 case frame으로 fallback. 각 fallback은 warning으로 남겨 조용히
 *  엉뚱한 이미지가 잡히는 일을 막는다. */
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
