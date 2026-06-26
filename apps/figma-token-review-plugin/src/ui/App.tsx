import { Box } from '@vapor-ui/core';

import { ScanResultView } from './components/ScanResultView';
import { SelectionBanner } from './components/SelectionBanner';
import { ErrorState } from './components/states/ErrorState';
import { LoadingState } from './components/states/LoadingState';
import { SuccessState } from './components/states/SuccessState';
import { useFocusToasts } from './hooks/useFocusToasts';
import { useScanResult } from './hooks/useScanResult';
import { useSelection } from './hooks/useSelection';

const App = () => {
    const selection = useSelection();
    const scan = useScanResult();
    useFocusToasts();

    const handleScan = (frameId: string) => {
        const name = selection.kind === 'frame' ? selection.name : '';
        scan.start(frameId, name);
    };

    return (
        <Box className="min-h-screen bg-white">
            {scan.match({
                idle: () => <SelectionBanner selection={selection} onScan={handleScan} />,
                loading: () => <LoadingState />,
                clean: () => <SuccessState onReset={scan.reset} />,
                error: ({ message }) => <ErrorState message={message} />,
                success: ({ frameName, payload }) => (
                    <ScanResultView frameName={frameName} payload={payload} />
                ),
            })}
        </Box>
    );
};

export default App;
