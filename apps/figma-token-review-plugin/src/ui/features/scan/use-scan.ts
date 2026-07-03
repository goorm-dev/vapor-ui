import { newRequestId, postToCode } from '~/common/messages';

import { useStore } from '../../shared/create-store';
import type { ScanState } from './store';
import { scanActions, scanStore } from './store';

export type UseScan = {
    state: ScanState;
    start: (frameId: string, frameName: string) => void;
    reset: () => void;
};

export function useScan(): UseScan {
    const state = useStore(scanStore);

    return {
        state,
        start: (frameId, frameName) => {
            const requestId = newRequestId();
            scanActions.start(frameName, requestId);
            postToCode({ type: 'scan', frameId, requestId });
        },
        reset: scanActions.reset,
    };
}
