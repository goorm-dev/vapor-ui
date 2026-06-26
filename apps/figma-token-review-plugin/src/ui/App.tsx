import { Box } from '@vapor-ui/core';

import { ResizeHandle } from './components/resize-handler';
import { ScanResultView } from './components/scan-result-view';
import { SelectionBanner } from './components/selection-banner';
import { ErrorState } from './components/states/error';
import { LoadingState } from './components/states/loading';
import { SuccessState } from './components/states/success';
import { useFocusToasts } from './hooks/use-focus-toasts';
import { useScanResult } from './hooks/use-scan-result';
import { useSelection } from './hooks/use-selection';

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

            <ResizeHandle />
        </Box>
    );
};

export default App;
