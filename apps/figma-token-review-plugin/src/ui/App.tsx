import { Box } from '@vapor-ui/core';

import { Loader } from './components/loader';
import { ResizeHandle } from './components/resize-handler';
import type { ScanState } from './features/scan';
import { useScan } from './features/scan';
import { HomePage } from './pages/home';
import { ScanResultPage } from './pages/scan-result';
import { SuccessPage } from './pages/success';

const App = () => {
    const { state } = useScan();

    return (
        <Box className="min-h-screen bg-white">
            {renderScan(state)}
            <ResizeHandle />
        </Box>
    );
};

function renderScan(state: ScanState) {
    switch (state.kind) {
        case 'idle':
            return <HomePage />;
        case 'loading':
            return <Loader />;
        case 'clean':
            return <SuccessPage />;
        case 'success':
            return <ScanResultPage payload={state.payload} />;
    }
}

export default App;
