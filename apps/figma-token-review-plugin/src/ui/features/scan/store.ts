import type { RequestId } from '~/common/messages';
import type { ScanPayload } from '~/common/schemas';

import { createStore } from '../../shared/create-store';
import type { LlmProgress } from '../llm';

/**
 * 마지막 scan 시점의 frame snapshot. 재검사 gating(선택 이탈 감지) 용도로 유지된다.
 * 현재 selection은 useSelection에서 읽는다 — 여기선 관여하지 않는다.
 */
type LastScanned = {
    lastScannedFrameId: string | null;
    lastScannedFrameName: string | null;
};

export type LoadingProgress = {
    startedAt: number;
    llm: LlmProgress | null;
};

export type ScanState = LastScanned &
    (
        | { kind: 'idle' }
        | { kind: 'loading'; requestId: RequestId; progress: LoadingProgress }
        | { kind: 'clean' }
        | { kind: 'success'; payload: ScanPayload }
    );

const INITIAL_LAST_SCANNED: LastScanned = {
    lastScannedFrameId: null,
    lastScannedFrameName: null,
};

export const scanStore = createStore<ScanState>({ ...INITIAL_LAST_SCANNED, kind: 'idle' });

export const scanActions = {
    start(frameId: string, frameName: string, requestId: RequestId) {
        scanStore.setState({
            kind: 'loading',
            requestId,
            progress: { startedAt: Date.now(), llm: null },
            lastScannedFrameId: frameId,
            lastScannedFrameName: frameName,
        });
    },
    progress(requestId: RequestId, llm: LlmProgress) {
        const state = scanStore.getState();
        if (state.kind !== 'loading' || state.requestId !== requestId) return;
        scanStore.setState({
            ...state,
            progress: { ...state.progress, llm },
        });
    },
    result(payload: ScanPayload, requestId: RequestId) {
        const state = scanStore.getState();
        if (state.kind !== 'loading') return;
        if (state.requestId !== requestId) return;

        const empty =
            payload.color.violations.length === 0 &&
            payload.typography.violations.length === 0 &&
            payload.space.violations.length === 0 &&
            payload.dimension.violations.length === 0 &&
            payload.borderRadius.violations.length === 0 &&
            payload.shadow.violations.length === 0;

        scanStore.setState({
            kind: empty ? 'clean' : 'success',
            lastScannedFrameId: state.lastScannedFrameId,
            lastScannedFrameName: state.lastScannedFrameName,
            ...(empty ? {} : { payload }),
        } as ScanState);
    },
    error(requestId: RequestId): boolean {
        const state = scanStore.getState();
        if (state.kind === 'loading' && state.requestId !== requestId) return false;
        scanStore.setState({ ...INITIAL_LAST_SCANNED, kind: 'idle' });
        return true;
    },
    reset() {
        scanStore.setState({ ...INITIAL_LAST_SCANNED, kind: 'idle' });
    },
};
