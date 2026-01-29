import { useEffect } from 'react';

import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useValueAsRef } from '@base-ui/utils/useValueAsRef';

import { useAnimationsFinished } from './use-animation-finished';

export interface Parameters {
    enabled?: boolean;
    open?: boolean;
    ref: React.RefObject<HTMLElement | null>;
    onComplete: () => void;
}

/**
 * Credit to the MUI/Base team
 * @link https://github.com/mui/base-ui/blob/master/packages/react/src/utils/useOpenChangeComplete.tsx
 *
 * Calls the provided function when the CSS open/close animation or transition completes.
 */
export function useOpenChangeComplete(parameters: Parameters) {
    const { enabled = true, open, ref, onComplete: onCompleteParam } = parameters;

    const openRef = useValueAsRef(open);
    const onComplete = useStableCallback(onCompleteParam);
    const runOnceAnimationsFinish = useAnimationsFinished(ref, open);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        runOnceAnimationsFinish(() => {
            if (open === openRef.current) {
                onComplete();
            }
        });
    }, [enabled, open, onComplete, runOnceAnimationsFinish, openRef]);
}
