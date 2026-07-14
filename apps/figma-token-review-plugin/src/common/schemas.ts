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

export type LlmPassJudgment = {
    nodeId: string;
    name: string;
    token: string;
    axis: 'hierarchy' | 'role' | 'viewport';
    matchedRule: string;
    reasoning: string;
    confidence: Confidence;
};

export type EvaluateOutput = {
    violations: Violation[];
    conformant: Conformant[];
    summary: EvaluateSummary;
    passJudgments?: LlmPassJudgment[];
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

export type ColorUsage = {
    nodeId: string;
    nodeIds?: string[];
    count?: number;
    name: string;
    property: ColorProperty;
    token: string | null;
    hex: string | null;
    tokenStatus: TokenStatus;
    background: ColorBackground | null;
};

export type TypographyResolved = {
    fontSize: number | null;
    lineHeight: unknown;
    letterSpacing: unknown;
    fontName: unknown;
};

export type TypographyUsage = {
    nodeId: string;
    nodeIds?: string[];
    count?: number;
    name: string;
    characters: string;
    textStyle: string | null;
    viewport: Viewport;
    appliedStatus: AppliedStatus;
    overriddenFields: string[];
    resolved: TypographyResolved;
};

export type SpaceUsage = {
    nodeId: string;
    name: string;
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
    token: string | null;
    tokenStatus: TokenStatus;
};

export type DimensionUsage = {
    nodeId: string;
    name: string;
    property: 'width' | 'height';
    value: string;
    token: string | null;
    tokenStatus: TokenStatus;
};

export type RadiusUsage = {
    nodeId: string;
    name: string;
    value: string;
    token: string | null;
    tokenStatus: TokenStatus;
};

export type ShadowUsage = {
    nodeId: string;
    name: string;
    value: string;
    token: string | null;
    tokenStatus: TokenStatus;
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
    childIds: string[];
    x: number;
    y: number;
    w: number;
    h: number;
    characters?: string; // TEXT nodes only, 60-char cap
    textStyle?: string; // TEXT nodes only, bound style name if any
};

export type LlmContext = {
    screenshotB64: string;
    nodeTree: NodeInfo[];
};
