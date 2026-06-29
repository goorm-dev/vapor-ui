/* -------------------------------------------------------------------------------------------------
 * Domain types (formerly src/shared/schema.ts)
 * -----------------------------------------------------------------------------------------------*/

export type Severity = 'high' | 'info';

export type ViolationType =
    | 'token-not-used'
    | 'unknown-token'
    | 'do-not-use'
    | 'role-mismatch'
    | 'fg-grade-mismatch'
    | 'fg-grade-ambiguous'
    | 'typo-raw'
    | 'typo-styled-override';

export type Violation = {
    nodeId: string;
    nodeIds?: string[];
    count?: number;
    name: string;
    token: string | null;
    type: ViolationType;
    severity: Severity;
    detail: string;
    suggested: string[];
};

export type Conformant = {
    nodeId: string;
    nodeIds?: string[];
    name: string;
    token: string;
};

export type EvaluateSummary = {
    total: number;
    conformCount: number;
    conformanceRate: number | null;
    highViolations: number;
    infoFlags: number;
};

export type EvaluateOutput = {
    violations: Violation[];
    conformant: Conformant[];
    summary: EvaluateSummary;
    rubric?: Record<string, unknown>;
};

export type ScanPayload = {
    color: EvaluateOutput;
    typography: EvaluateOutput;
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
    stats: RawExtractStats;
};
