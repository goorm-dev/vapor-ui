/* -------------------------------------------------------------------------------------------------
 * Domain types (formerly src/shared/schema.ts)
 * -----------------------------------------------------------------------------------------------*/

export type Severity = 'high' | 'info';
export type Confidence = 'HIGH' | 'MED' | 'LOW';
export type Origin = 'rule' | 'llm';

export type Property =
    | 'fill'
    | 'fill-on-text'
    | 'stroke'
    | 'padding'
    | 'paddingTop'
    | 'paddingRight'
    | 'paddingBottom'
    | 'paddingLeft'
    | 'paddingVertical'
    | 'paddingHorizontal'
    | 'gap'
    | 'width'
    | 'height'
    | 'borderRadius'
    | 'shadow'
    | 'textStyle';

export type Role =
    | 'background'
    | 'foreground'
    | 'border'
    | 'space'
    | 'dimension'
    | 'borderRadius'
    | 'shadow';

export type Category = 'color' | 'space' | 'dimension' | 'typography' | 'borderRadius' | 'shadow';

export type ViolationType =
    | 'token-not-used'
    | 'primitive-used'
    | 'unknown-token'
    | 'do-not-use'
    | 'role-mismatch'
    | 'fg-grade-mismatch'
    | 'fg-grade-ambiguous'
    | 'text-contrast-low'
    | 'typo-raw'
    | 'typo-styled-override'
    | 'semantic-misfit' // heuristic: LLM 의미 판정 FAIL (color)
    | 'typo-hierarchy' // heuristic: LLM 텍스트 위계 FAIL
    | 'typo-role-misfit' // heuristic: LLM 텍스트 역할 부적합
    | 'typo-viewport-misfit'; // heuristic: LLM 텍스트 뷰포트 부적합

export type Violation = {
    nodeId: string;
    nodeIds?: string[];
    count?: number;
    name: string;
    property: Property;
    token: string | null;
    value: string | null;
    type: ViolationType;
    severity: Severity;
    origin: Origin;
    message: string;
    suggested: string[];
    confidence?: Confidence; // only when origin === 'llm'
    /** 원본이 💙 DS 컴포넌트였으나 detach된 노드 (재컴포넌트화 포함). 리포트 뱃지 노출용. */
    wasDs?: boolean;
};

export type Conformant = {
    nodeId: string;
    nodeIds?: string[];
    name: string;
    property: Property;
    token: string;
};

export type EvaluateSummary = {
    total: number;
    conformCount: number;
    conformanceRate: number | null;
    // severity 축: origin/confidence 무관, severity 만으로 카운트
    highViolations: number;
    infoFlags: number;
    // 자신도(confidence) 축: LLM 판정만 대상, severity 와 겹침 허용
    heuristicViolations: number; // origin === 'llm' 전체
    lowConfidenceCount: number; // origin === 'llm' && confidence !== 'HIGH'
};

export type EvaluateOutput = {
    violations: Violation[];
    conformant: Conformant[];
    summary: EvaluateSummary;
};

export type ScanPayload = {
    color: EvaluateOutput;
    space: EvaluateOutput;
    dimension: EvaluateOutput;
    typography: EvaluateOutput;
    borderRadius: EvaluateOutput;
    shadow: EvaluateOutput;
    schemaMode: SchemaMode;
};

export type SelectionState =
    | { kind: 'frame'; id: string; name: string }
    | { kind: 'none' }
    | { kind: 'multi' }
    | { kind: 'invalid'; nodeType: string };

export type Viewport = 'pc' | 'tablet' | 'mobile';

export type SchemaMode = 'light' | 'dark';

export type ColorProperty = 'fill' | 'stroke' | 'text';

export type TokenStatus = 'ok' | 'raw' | 'unknown';

export type BackgroundKind = 'white' | 'other' | 'transparent' | 'ambiguous';

export type AppliedStatus = 'styled-clean' | 'styled-override' | 'var-only' | 'raw' | 'mixed';

export type ColorBackground = {
    kind: BackgroundKind;
    hex: string | null;
};

/** 모든 Usage 공통: 발생 노드 식별 정보. */
export type NodeRef = {
    nodeId: string;
    name: string;
    /** 원본이 💙 DS 컴포넌트였으나 detach된 노드에서 온 usage. */
    wasDs?: boolean;
};

/** 토큰 해석 결과 공통 묶음. */
export type TokenInfo = {
    token: string | null;
    /** Variable Mode 로 semantic 을 래핑한 경우 실제 노드에 바인딩된 outer variable 이름. */
    appliedToken?: string | null;
    tokenStatus: TokenStatus;
};

export type ColorUsage = NodeRef &
    TokenInfo & {
        nodeIds?: string[];
        count?: number;
        property: ColorProperty;
        hex: string | null;
        background: ColorBackground | null;
        /** TEXT 노드 fill 에 붙는 메타. fontSize/isBold 는 WCAG large-text 판정용, PNG 는 배경이 ambiguous 일 때만 첨부. */
        textShot?: TextShot;
    };

export type TextShot = {
    fontSize: number;
    isBold: boolean;
    /** 부모(배경) 노드를 텍스트 숨긴 상태에서 exportAsync 로 캡처한 PNG (base64). ambiguous 배경일 때만 존재. */
    imageBase64?: string;
    /** PNG 픽셀 좌표계에서 텍스트 노드 bbox. exportAsync scale 이 이미 반영된 값. */
    cropX?: number;
    cropY?: number;
    cropW?: number;
    cropH?: number;
};

export type TypographyResolved = {
    fontSize: number | null;
    lineHeight: unknown;
    letterSpacing: unknown;
    fontName: unknown;
};

export type TypographyUsage = NodeRef & {
    nodeIds?: string[];
    count?: number;
    characters: string;
    textStyle: string | null;
    viewport: Viewport;
    appliedStatus: AppliedStatus;
    overriddenFields: string[];
    resolved: TypographyResolved;
};

export type SpaceUsage = NodeRef &
    TokenInfo & {
        property:
            | 'padding'
            | 'paddingTop'
            | 'paddingRight'
            | 'paddingBottom'
            | 'paddingLeft'
            | 'paddingVertical'
            | 'paddingHorizontal'
            | 'gap';
        value: string;
    };

export type DimensionUsage = NodeRef &
    TokenInfo & {
        property: 'width' | 'height';
        value: string;
    };

export type RadiusUsage = NodeRef & TokenInfo & { value: string };

/** shadow 는 effect-style 단일 조회라 appliedToken 이 없다 — TokenInfo 미상속. */
export type ShadowUsage = NodeRef & {
    token: string | null;
    tokenStatus: TokenStatus;
    value: string;
};

export type RawExtractStats = {
    nodeCount: number;
    textNodes: number;
    visited: number;
};

export type RawExtract = {
    schemaMode: SchemaMode;
    viewport: Viewport;
    colors: ColorUsage[];
    typography: TypographyUsage[];
    spaces: SpaceUsage[];
    dimensions: DimensionUsage[];
    radii: RadiusUsage[];
    shadows: ShadowUsage[];
    stats: RawExtractStats;
};

export type NodeInfo = {
    id: string;
    type: string;
    name: string;
    parentId: string | null;
    characters?: string; // TEXT nodes only, 30-char cap
    textStyle?: string; // TEXT nodes only, bound style name if any
};

export type LlmContext = {
    screenshotB64: string;
    nodeTree: NodeInfo[];
};
