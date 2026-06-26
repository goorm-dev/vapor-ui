import { useCallback, useEffect } from 'react';

import type { ScanPayload } from '~/shared/schema';

import { postToCode, subscribe } from '../messaging';
import { useFunnel } from './useFunnel';

export type ScanStatus =
    | { kind: 'idle' }
    | { kind: 'loading' }
    | { kind: 'clean' }
    | { kind: 'success'; payload: ScanPayload }
    | { kind: 'error'; message: string };

export function useScanResult() {
    const { setState, match } = useFunnel<ScanStatus>({ kind: 'idle' });

    useEffect(() => {
        return subscribe((msg) => {
            if (msg.type === 'scan-error') {
                setState({ kind: 'error', message: msg.message });
                return;
            }
            if (msg.type !== 'scan-result') return;

            const { color, typography } = msg.payload;
            const empty = color.violations.length === 0 && typography.violations.length === 0;

            setState(empty ? { kind: 'clean' } : { kind: 'success', payload: msg.payload });
        });
    }, [setState]);

    const start = useCallback(
        (frameId: string) => {
            setState({ kind: 'loading' });
            postToCode({ type: 'scan', frameId });
        },
        [setState],
    );

    const reset = useCallback(() => setState({ kind: 'idle' }), [setState]);

    return { match, start, reset };
}
