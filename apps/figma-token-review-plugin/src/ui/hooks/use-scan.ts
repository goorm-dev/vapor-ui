import { newRequestId } from '~/shared/protocol';

import { postToCode } from '../messaging';
import { useStore } from '../store/create-store';
import type { ScanState } from '../store/scan';
import { scanActions, scanStore } from '../store/scan';

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
