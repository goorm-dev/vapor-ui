import { useCallback, useEffect } from 'react';

import type { ScanPayload } from '~/shared/schema';

import { postToCode, subscribe } from '../messaging';
import { useFunnel } from './use-funnel';

export type ScanStatus =
    | { kind: 'idle' }
    | { kind: 'loading'; frameName: string }
    | { kind: 'clean'; frameName: string }
    | { kind: 'success'; frameName: string; payload: ScanPayload }
    | { kind: 'error'; message: string };

export function useScanResult() {
    const { state, setState, match } = useFunnel<ScanStatus>({ kind: 'idle' });

    useEffect(() => {
        return subscribe((msg) => {
            if (msg.type === 'scan-error') {
                setState({ kind: 'error', message: msg.message });
                return;
            }
            if (msg.type !== 'scan-result') return;

            const frameName =
                state.kind === 'loading' || state.kind === 'success' || state.kind === 'clean'
                    ? state.frameName
                    : '';
            const { color, typography } = msg.payload;
            const empty = color.violations.length === 0 && typography.violations.length === 0;

            setState(
                empty
                    ? { kind: 'clean', frameName }
                    : { kind: 'success', frameName, payload: msg.payload },
            );
        });
    }, [setState, state]);

    const start = useCallback(
        (frameId: string, frameName: string) => {
            setState({ kind: 'loading', frameName });
            postToCode({ type: 'scan', frameId });
        },
        [setState],
    );

    const reset = useCallback(() => setState({ kind: 'idle' }), [setState]);

    return { match, start, reset };
}
