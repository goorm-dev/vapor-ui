import { Box } from '@vapor-ui/core';

import type { SelectionState } from '~/common/schemas';

import { Loader } from './components/loader';
import { ResizeHandle } from './components/resize-handler';
import type { ScanState } from './features/scan';
import { useScan } from './features/scan';
import { useSelection } from './features/selection';
import { HomePage } from './pages/home';
import { ScanResultPage } from './pages/scan-result';
import { SuccessPage } from './pages/success';

const App = () => {
    const selection = useSelection();
    const { state, start, reset } = useScan();

    const handleScan = (frameId: string) => {
        const name = selection.kind === 'frame' ? selection.name : '';
        start(frameId, name);
    };

    return (
        <Box className="min-h-screen bg-white">
            {renderScan(state, selection, handleScan, reset)}
            <ResizeHandle />
        </Box>
    );
};

function renderScan(
    state: ScanState,
    selection: SelectionState,
    onScan: (frameId: string) => void,
    onReset: () => void,
) {
    switch (state.kind) {
        case 'idle':
            return <HomePage selection={selection} onScan={onScan} />;
        case 'loading':
            return <Loader />;
        case 'clean':
            return <SuccessPage onReset={onReset} />;
        case 'success':
            return <ScanResultPage frameName={state.frameName} payload={state.payload} />;
    }
}

export default App;
