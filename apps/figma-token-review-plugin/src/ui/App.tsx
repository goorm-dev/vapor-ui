import { useEffect, useState } from 'react';
import { Box } from '@vapor-ui/core';

import type { SelectionState } from '~/shared/schema';
import { postToCode, subscribe } from './messaging';
import { SelectionBanner } from './components/SelectionBanner';

const App = () => {
    const [selection, setSelection] = useState<SelectionState>({ kind: 'none' });

    useEffect(() => {
        const unsubscribe = subscribe((msg) => {
            if (msg.type === 'selection') setSelection(msg.state);
        });
        postToCode({ type: 'request-selection' });
        return unsubscribe;
    }, []);

    const handleScan = (frameId: string) => {
        postToCode({ type: 'scan', frameId });
    };

    return (
        <Box className="min-h-screen bg-v-gray-50">
            <SelectionBanner state={selection} onScan={handleScan} />
        </Box>
    );
};

export default App;
