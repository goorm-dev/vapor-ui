import type { ScanPayload } from '~/shared/schema';

import colorFixture from '../../fixtures/color.json';
import typographyFixture from '../../fixtures/typography.json';

const SIMULATED_LATENCY_MS = 1500;

export async function callEvaluator(_frameId: string): Promise<ScanPayload> {
    await new Promise<void>((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));

    return {
        color: colorFixture as ScanPayload['color'],
        typography: typographyFixture as ScanPayload['typography'],
    };
}
