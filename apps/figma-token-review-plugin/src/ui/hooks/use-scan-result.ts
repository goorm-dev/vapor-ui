import { useCallback, useEffect, useRef } from 'react';

import type { ScanPayload } from '~/shared/schema';

import { postToCode, subscribe } from '../messaging';
import { useFunnel } from './use-funnel';

type Variant = { kind: string };

export type ScanResultBuilder<TStatus extends Variant> = {
    initial: TStatus;
    onStart: (frameName: string) => TStatus;
    onResult: (frameName: string, payload: ScanPayload, isEmpty: boolean) => TStatus;
    onError: (message: string) => TStatus;
};

export function useScanResult<TStatus extends Variant>(builder: ScanResultBuilder<TStatus>) {
    const { setState, match } = useFunnel<TStatus>(builder.initial);
    const builderRef = useRef(builder);
    builderRef.current = builder;
    const frameNameRef = useRef('');

    useEffect(() => {
        return subscribe((msg) => {
            if (msg.type === 'scan-error') {
                setState(builderRef.current.onError(msg.message));
                return;
            }
            if (msg.type !== 'scan-result') return;

            const { color, typography } = msg.payload;
            const empty = color.violations.length === 0 && typography.violations.length === 0;
            setState(builderRef.current.onResult(frameNameRef.current, msg.payload, empty));
        });
    }, [setState]);

    const start = useCallback(
        (frameId: string, frameName: string) => {
            frameNameRef.current = frameName;
            setState(builderRef.current.onStart(frameName));
            postToCode({ type: 'scan', frameId });
        },
        [setState],
    );

    const reset = useCallback(() => setState(builderRef.current.initial), [setState]);

    return { match, start, reset };
}
