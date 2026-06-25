import { useEffect, useState } from 'react';
import { Box } from '@vapor-ui/core';

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
                    return;
            }
        });
        postToCode({ type: 'request-selection' });
        return unsubscribe;
    }, []);

    const handleScan = (frameId: string) => {
        setScan({ kind: 'loading' });
        postToCode({ type: 'scan', frameId });
    };

    return (
        <Box className="min-h-screen bg-v-gray-50">
            <SelectionBanner state={selection} onScan={handleScan} />
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
