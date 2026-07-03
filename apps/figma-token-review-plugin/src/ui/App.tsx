import { Box } from '@vapor-ui/core';

import type { SelectionState } from '~/shared/schema';

import { Loader } from './components/loader';
import { ResizeHandle } from './components/resize-handler';
import { useScan } from './hooks/use-scan';
import { useSelection } from './hooks/use-selection';
import { HomePage } from './pages/home';
import { ScanResultPage } from './pages/scan-result';
import { SuccessPage } from './pages/success';
import type { ScanState } from './store/scan';

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
