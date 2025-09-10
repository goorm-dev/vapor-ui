import { useEffect } from 'react';

import { useEventCallback } from '@base-ui-components/utils/useEventCallback';
import { useLatestRef } from '@base-ui-components/utils/useLatestRef';

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

    const openRef = useLatestRef(open);
    const onComplete = useEventCallback(onCompleteParam);
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
