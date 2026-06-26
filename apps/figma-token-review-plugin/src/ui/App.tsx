import { Box } from '@vapor-ui/core';

import type { ScanPayload } from '~/shared/schema';

import { Loader } from './components/loader';
import { ResizeHandle } from './components/resize-handler';
import { useFocusToasts } from './hooks/use-focus-toasts';
import { useScanResult } from './hooks/use-scan-result';
import { useSelection } from './hooks/use-selection';
import { MainPage } from './pages/main';
import { ScanResultPage } from './pages/scan-result';
import { SuccessPage } from './pages/success';

type ScanStatus =
    | { kind: 'idle' }
    | { kind: 'loading' }
    | { kind: 'clean'; frameName: string }
    | { kind: 'success'; frameName: string; payload: ScanPayload };

const App = () => {
    const selection = useSelection();
    const scan = useScanResult<ScanStatus>({
        initial: { kind: 'idle' },
        onStart: () => ({ kind: 'loading' }),
        onResult: (frameName, payload, isEmpty) =>
            isEmpty ? { kind: 'clean', frameName } : { kind: 'success', frameName, payload },
        onError: () => ({ kind: 'idle' }),
    });
    useFocusToasts();

    const handleScan = (frameId: string) => {
        const name = selection.kind === 'frame' ? selection.name : '';
        scan.start(frameId, name);
    };

    return (
        <Box className="min-h-screen bg-white">
            {scan.match({
                idle: () => <MainPage selection={selection} onScan={handleScan} />,
                clean: () => <SuccessPage onReset={scan.reset} />,
                loading: () => <Loader />,
                success: ({ frameName, payload }) => (
                    <ScanResultPage frameName={frameName} payload={payload} />
                ),
            })}

            <ResizeHandle />
        </Box>
    );
};

export default App;
