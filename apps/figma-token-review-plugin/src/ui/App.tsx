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

    return (
        <Box className="min-h-screen bg-white">
            {scan.match({
                idle: () => <SelectionBanner selection={selection} onScan={scan.start} />,
                loading: () => <LoadingState />,
                clean: () => <SuccessState onReset={scan.reset} />,
                error: ({ message }) => <ErrorState message={message} />,
                success: ({ payload }) => <ScanResultView payload={payload} />,
            })}
        </Box>
    );
};

export default App;
