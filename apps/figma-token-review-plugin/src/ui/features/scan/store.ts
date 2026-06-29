import type { RequestId } from '~/common/messages';
import type { ScanPayload } from '~/common/schemas';

import { createStore } from '../../shared/create-store';

export type ScanState =
    | { kind: 'idle' }
    | { kind: 'loading'; frameName: string; requestId: RequestId }
    | { kind: 'clean'; frameName: string }
    | { kind: 'success'; frameName: string; payload: ScanPayload };

export const scanStore = createStore<ScanState>({ kind: 'idle' });

export const scanActions = {
    start(frameName: string, requestId: RequestId) {
        scanStore.setState({ kind: 'loading', frameName, requestId });
    },
    result(payload: ScanPayload, requestId: RequestId | undefined) {
        const state = scanStore.getState();
        if (state.kind !== 'loading') return;
        if (state.requestId !== requestId) return;

        const empty =
            payload.color.violations.length === 0 && payload.typography.violations.length === 0;

        scanStore.setState(
            empty
                ? { kind: 'clean', frameName: state.frameName }
                : { kind: 'success', frameName: state.frameName, payload },
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
