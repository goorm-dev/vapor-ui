import type {
    ColorUsage,
    DimensionUsage,
    RadiusUsage,
    ShadowUsage,
    SpaceUsage,
    TypographyUsage,
    Viewport,
} from '~/common/schemas';

/**
 * 💙 DS 인스턴스 하위에서 특정 필드만 감사 대상으로 좁힐 때 사용.
 * null = 전체 감사 (제약 없음).
 */
export type OverrideFilter = ReadonlySet<string> | null;

/** 단일 노드에서 카테고리별로 추출된 사실 묶음. */
export type NodeFacts = {
    colors: ColorUsage[];
    typography: TypographyUsage[];
    spaces: SpaceUsage[];
    dimensions: DimensionUsage[];
    radii: RadiusUsage[];
    shadows: ShadowUsage[];
};

export type FactCategory = keyof NodeFacts;

/** 규칙이 방출하는 단위 — nodeId/name 은 엔진이 스탬핑하므로 제외. */
export type EmissionOf = {
    [C in FactCategory]: Omit<NodeFacts[C][number], 'nodeId' | 'name'>;
};

export type ExtractCtx = {
    /** root frame id — 자기 자신의 width/height 는 dimension 검사 대상 제외. */
    rootId: string;
    viewport: Viewport;
    /** node.boundVariables — 규칙마다 재파싱하지 않도록 캐시. */
    boundVariables: Record<string, { id: string }> | undefined;
    /**
     * 엔진이 rule.filterKeys 로 규칙 전체를 게이트하지만,
     * padding 처럼 규칙 내부에서 방향별 세분 필터가 필요한 reader 를 위해 노출.
     */
    filter: OverrideFilter;
};

/** 이름 있는 순수 가드. throw 금지 계약 — trace 에 실패 가드명이 남는다. */
export type NodeGuard = {
    name: string;
    test: (node: SceneNode, ctx: ExtractCtx) => boolean;
};

export type ExtractionRule<C extends FactCategory = FactCategory> = {
    /** trace 식별용. `카테고리:속성` 컨벤션 (예: 'dimension:width'). */
    name: string;
    category: C;
    /** OverrideFilter 키 — 하나라도 filter 에 있으면 규칙 실행. 엔진이 중앙 판정. */
    filterKeys: readonly string[];
    /** 전부 통과해야 실행. */
    guards?: readonly NodeGuard[];
    extract: (node: SceneNode, ctx: ExtractCtx) => Promise<EmissionOf[C][]>;
};

/** 카테고리별 규칙의 분배 유니온 — RULES 테이블 원소 타입. */
export type AnyExtractionRule = {
    [C in FactCategory]: ExtractionRule<C>;
}[FactCategory];

export type RuleTrace =
    | { rule: string; skipped: 'filter' | `guard:${string}` }
    | { rule: string; emitted: number }
    | { rule: string; error: string };
