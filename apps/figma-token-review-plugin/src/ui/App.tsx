import { useEffect, useState } from 'react';
import { Box, Text } from '@vapor-ui/core';

import type { ScanPayload, SelectionState } from '~/shared/schema';
import { postToCode, subscribe } from './messaging';
import { SelectionBanner } from './components/SelectionBanner';
import { TabHeader } from './components/TabHeader';
import { ViolationList } from './components/ViolationList';
import { LoadingState } from './components/states/LoadingState';
import { ErrorState } from './components/states/ErrorState';

type ScanStatus =
    | { kind: 'idle' }
    | { kind: 'loading' }
    | { kind: 'success'; payload: ScanPayload }
    | { kind: 'error'; message: string };

type Tab = 'color' | 'typography';

const App = () => {
    const [selection, setSelection] = useState<SelectionState>({ kind: 'none' });
    const [scan, setScan] = useState<ScanStatus>({ kind: 'idle' });
    const [tab, setTab] = useState<Tab>('color');
    const [toast, setToast] = useState<string | null>(null);

    useEffect(() => {
        if (!toast) return;
        const id = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(id);
    }, [toast]);

    useEffect(() => {
        const unsubscribe = subscribe((msg) => {
            switch (msg.type) {
                case 'selection':
                    setSelection(msg.state);
                    return;
                case 'scan-result':
                    setScan({ kind: 'success', payload: msg.payload });
                    return;
                case 'scan-error':
                    setScan({ kind: 'error', message: msg.message });
                    return;
                case 'focus-result':
                    if (msg.resolved > 0 && msg.missing > 0) {
                        setToast(`${msg.missing}개 노드 누락`);
                    }
                    return;
                case 'focus-error':
                    setToast(msg.message);
                    return;
                default: {
                    const _exhaustive: never = msg;
                    return _exhaustive;
                }
            }
        });
        postToCode({ type: 'request-selection' });
        return unsubscribe;
    }, []);

    const handleAttemptScan = () => {
        switch (selection.kind) {
            case 'frame':
                setScan({ kind: 'loading' });
                postToCode({ type: 'scan', frameId: selection.id });
                return;
            case 'none':
                setToast('프레임을 1개 선택해 주세요.');
                return;
            case 'multi':
                setToast('프레임 1개만 선택해 주세요.');
                return;
            case 'invalid':
                setToast(`프레임 노드만 선택할 수 있습니다. (현재: ${selection.nodeType})`);
                return;
        }
    };

    return (
        <Box className="min-h-screen bg-white">
            {toast && (
                <Box className="bg-v-yellow-50 px-v-200 py-v-100">
                    <Text typography="body4" className="text-v-yellow-800">{toast}</Text>
                </Box>
            )}
            {scan.kind === 'idle' && <SelectionBanner onAttemptScan={handleAttemptScan} />}
            {scan.kind === 'loading' && <LoadingState />}
            {scan.kind === 'error' && <ErrorState message={scan.message} />}
            {scan.kind === 'success' && (
                <>
                    <TabHeader
                        active={tab}
                        colorCount={scan.payload.color.violations.length}
                        typographyCount={scan.payload.typography.violations.length}
                        onChange={setTab}
                    />
                    <ViolationList
                        violations={scan.payload[tab].violations}
                        summary={scan.payload[tab].summary}
                    />
                </>
            )}
        </Box>
    );
};

export default App;
