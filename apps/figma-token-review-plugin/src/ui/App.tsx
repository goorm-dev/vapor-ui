import { useEffect, useState } from 'react';
import { Box, Text } from '@vapor-ui/core';

import type { ScanPayload, SelectionState } from '~/shared/schema';
import { postToCode, subscribe } from './messaging';
import { SelectionBanner } from './components/SelectionBanner';
import { LoadingState } from './components/states/LoadingState';
import { ErrorState } from './components/states/ErrorState';

type ScanStatus =
    | { kind: 'idle' }
    | { kind: 'loading' }
    | { kind: 'success'; payload: ScanPayload }
    | { kind: 'error'; message: string };

const App = () => {
    const [selection, setSelection] = useState<SelectionState>({ kind: 'none' });
    const [scanStatus, setScanStatus] = useState<ScanStatus>({ kind: 'idle' });

    useEffect(() => {
        const unsubscribe = subscribe((msg) => {
            switch (msg.type) {
                case 'selection':
                    setSelection(msg.state);
                    break;
                case 'scan-result':
                    setScanStatus({ kind: 'success', payload: msg.payload });
                    break;
                case 'scan-error':
                    setScanStatus({ kind: 'error', message: msg.message });
                    break;
                case 'focus-result':
                    // Task 8 will handle this
                    break;
            }
        });
        postToCode({ type: 'request-selection' });
        return unsubscribe;
    }, []);

    const handleScan = (frameId: string) => {
        setScanStatus({ kind: 'loading' });
        postToCode({ type: 'scan', frameId });
    };

    return (
        <Box className="min-h-screen bg-v-gray-50">
            <SelectionBanner state={selection} onScan={handleScan} />
            {scanStatus.kind === 'loading' && <LoadingState />}
            {scanStatus.kind === 'error' && <ErrorState message={scanStatus.message} />}
            {scanStatus.kind === 'success' && (
                <Text typography="body2">
                    violations: color={scanStatus.payload.color.summary.violationsCount} typography=
                    {scanStatus.payload.typography.summary.violationsCount}
                </Text>
            )}
        </Box>
    );
};

export default App;
