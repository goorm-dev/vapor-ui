import { describe, expect, it } from 'vitest';

import * as protocol from './fiber-protocol';

describe('isFiberResponseForRequest', () => {
    const isFiberResponseForRequest = (
        protocol as typeof protocol & {
            isFiberResponseForRequest?: (data: unknown, requestId: string) => boolean;
        }
    ).isFiberResponseForRequest;

    it('accepts only the response for the current request', () => {
        expect(
            isFiberResponseForRequest?.(
                {
                    type: protocol.FIBER_RESPONSE,
                    requestId: 'current',
                    components: ['Button'],
                },
                'current',
            ),
        ).toBe(true);
        expect(
            isFiberResponseForRequest?.(
                {
                    type: protocol.FIBER_RESPONSE,
                    requestId: 'stale',
                    components: ['Card'],
                },
                'current',
            ),
        ).toBe(false);
    });

    it('rejects malformed or oversized component lists from the page', () => {
        expect(
            isFiberResponseForRequest?.(
                {
                    type: protocol.FIBER_RESPONSE,
                    requestId: 'current',
                    components: [{}],
                },
                'current',
            ),
        ).toBe(false);
        expect(
            isFiberResponseForRequest?.(
                {
                    type: protocol.FIBER_RESPONSE,
                    requestId: 'current',
                    components: ['A', 'B', 'C', 'D'],
                },
                'current',
            ),
        ).toBe(false);
    });
});
