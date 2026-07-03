export type Severity = 'high' | 'info';

export type ViolationType =
    | 'token-not-used'
    | 'unknown-token'
    | 'do-not-use'
    | 'role-mismatch'
    | 'fg-grade-mismatch'
    | 'fg-grade-ambiguous';

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
    name: string;
    token: string;
};

export type EvaluateOutput = {
    violations: Violation[];
    conformant: Conformant[];
    summary: {
        total: number;
        violationsCount: number;
        highSeverity: number;
    };
    rubric: {
        version: string;
        source: string;
    };
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

export type CodeMsg =
    | { type: 'selection'; state: SelectionState }
    | { type: 'scan-result'; payload: ScanPayload }
    | { type: 'scan-error'; message: string }
    | { type: 'focus-result'; resolved: number; missing: number }
    | { type: 'focus-error'; message: string };

export type UiMsg =
    | { type: 'request-selection' }
    | { type: 'scan'; frameId: string }
    | { type: 'focus'; nodeIds: string[] }
    | { type: 'resize'; width: number; height: number; commit?: boolean };
