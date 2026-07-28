import type { Viewport } from '~/common/schemas';

import { runRules } from './engine/engine';
import type { ExtractCtx, NodeFacts, OverrideFilter } from './engine/types';
import { RULES } from './rules';

// extract-frame.ts 가 이 모듈 경로에서 소비하는 타입 계약 유지.
export type { NodeFacts, OverrideFilter };

export type VisitCtx = {
    /** root frame id — 자기 자신의 width/height 는 dimension 검사 대상 제외. */
    rootId: string;
    viewport: Viewport;
};

/** 순회는 호출부(extract-frame.ts) 책임. */
export async function collectNodeFacts(
    node: SceneNode,
    ctx: VisitCtx,
    filter: OverrideFilter = null,
): Promise<NodeFacts> {
    const extractCtx: ExtractCtx = {
        rootId: ctx.rootId,
        viewport: ctx.viewport,
        boundVariables: (node as unknown as { boundVariables?: Record<string, { id: string }> })
            .boundVariables,
        filter,
    };

    const { facts } = await runRules(node, extractCtx, RULES);
    return facts;
}
