import type { EvaluateOutput, ScanPayload } from '~/shared/schema';

const SIMULATED_LATENCY_MS = 1500;

function makeEmpty(): EvaluateOutput {
    return {
        violations: [],
        conformant: [],
        summary: { total: 0, violationsCount: 0, highSeverity: 0 },
        rubric: { version: 'stub', source: 'callEvaluator stub' },
    };
}

export async function callEvaluator(_frameId: string): Promise<ScanPayload> {
    await new Promise<void>((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
    return {
        color: makeEmpty(),
        typography: makeEmpty(),
    };
}
