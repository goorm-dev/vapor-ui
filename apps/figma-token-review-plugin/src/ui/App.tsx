import { useState } from 'react';

import { Box } from '@vapor-ui/core';

import { Loader } from './components/loader';
import { ResizeHandle } from './components/resize-handler';
import { useApiKey } from './features/api-key';
import type { ScanState } from './features/scan';
import { useScan } from './features/scan';
import { HomePage } from './pages/home';
import { ScanResultPage } from './pages/scan-result';
import { SettingsPage } from './pages/settings';
import { SuccessPage } from './pages/success';

const App = () => {
    const { state: scan } = useScan();
    const { state: apiKey } = useApiKey();
    const [showSettings, setShowSettings] = useState(false);

    return (
        <Box className="min-h-screen bg-white">
            {renderBody({ scan, apiKey, showSettings, setShowSettings })}
            <ResizeHandle />
        </Box>
    );
};

type RenderArgs = {
    scan: ScanState;
    apiKey: ReturnType<typeof useApiKey>['state'];
    showSettings: boolean;
    setShowSettings: (v: boolean) => void;
};

function renderBody({ scan, apiKey, showSettings, setShowSettings }: RenderArgs) {
    if (apiKey.kind === 'unknown') return <Loader />;
    if (apiKey.kind === 'missing') return <SettingsPage />;
    if (showSettings) {
        return <SettingsPage dismissable onClose={() => setShowSettings(false)} />;
    }
    return renderScan(scan, () => setShowSettings(true));
}

function renderScan(state: ScanState, openSettings: () => void) {
    switch (state.kind) {
        case 'idle':
            return <HomePage onOpenSettings={openSettings} />;
        case 'loading':
            return <Loader />;
        case 'clean':
            return <SuccessPage />;
        case 'success':
            return <ScanResultPage payload={state.payload} />;
    }
}

export default App;
