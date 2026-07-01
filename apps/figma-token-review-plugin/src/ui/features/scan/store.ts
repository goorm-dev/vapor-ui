import type { RequestId } from '~/common/messages';
import type { ScanPayload } from '~/common/schemas';

import { createStore } from '../../shared/create-store';

export type ScanState =
    | { kind: 'idle' }
    | { kind: 'loading'; frameId: string; frameName: string; requestId: RequestId }
    | { kind: 'clean'; frameId: string; frameName: string }
    | { kind: 'success'; frameId: string; frameName: string; payload: ScanPayload };

export const scanStore = createStore<ScanState>({ kind: 'idle' });

export const scanActions = {
    start(frameId: string, frameName: string, requestId: RequestId) {
        scanStore.setState({ kind: 'loading', frameId, frameName, requestId });
    },
    result(payload: ScanPayload, requestId: RequestId | undefined) {
        const state = scanStore.getState();
        if (state.kind !== 'loading') return;
        if (state.requestId !== requestId) return;

        const empty =
            payload.color.violations.length === 0 && payload.typography.violations.length === 0;

        scanStore.setState(
            empty
                ? { kind: 'clean', frameId: state.frameId, frameName: state.frameName }
                : {
                      kind: 'success',
                      frameId: state.frameId,
                      frameName: state.frameName,
                      payload,
                  },
        );
    },
    error(requestId: RequestId | undefined): boolean {
        const state = scanStore.getState();
        if (state.kind === 'loading' && state.requestId !== requestId) return false;
        scanStore.setState({ kind: 'idle' });
        return true;
    },
    reset() {
        scanStore.setState({ kind: 'idle' });
    },
};
