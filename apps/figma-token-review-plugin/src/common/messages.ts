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

export type CodeMsg =
    | { type: 'selection'; state: SelectionState }
    | { type: 'extract-result'; payload: RawExtract }
    | { type: 'extract-error'; message: string }
    | { type: 'focus-result'; resolved: number; missing: number }
    | { type: 'focus-error'; message: string };

export type UiMsg =
    | { type: 'request-selection' }
    | { type: 'scan'; frameId: string }
    | { type: 'focus'; nodeIds: string[] }
    | { type: 'resize'; width: number; height: number; commit?: boolean };

/* -------------------------------------------------------------------------------------------------
 * Envelope + RequestId (formerly src/shared/protocol.ts)
 * -----------------------------------------------------------------------------------------------*/

export type RequestId = string;

export type Envelope<T> = T & { requestId?: RequestId };

export type UiEnvelope = Envelope<UiMsg>;

export type CodeEnvelope = Envelope<CodeMsg>;

export function newRequestId(): RequestId {
    return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/* -------------------------------------------------------------------------------------------------
 * Post helpers
 * -----------------------------------------------------------------------------------------------*/

/**
 * UI → plugin direction. Uses `parent` (DOM iframe global).
 * Tree-shaken from plugin bundle when only types are imported.
 */
export function postToCode(msg: UiMsg | UiEnvelope): void {
    parent.postMessage({ pluginMessage: msg }, '*');
}

/**
 * Plugin → UI direction. Uses `figma.ui` (plugin sandbox global).
 * Tree-shaken from UI bundle when only types are imported.
 */
export function postToUi(msg: CodeEnvelope, requestId?: RequestId): void {
    figma.ui.postMessage(requestId ? { ...msg, requestId } : msg);
}
