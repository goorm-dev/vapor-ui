import { Box } from '@vapor-ui/core';

import { ColorSystemTab } from './features/color-system-tab';

const App = () => {
    return (
        <Box className="bg-white p-v-100">
            {/* Unified Color System Interface */}
            <Box className="p-v-200">
                <ColorSystemTab />
            </Box>
        </Box>
    );
};

export default App;
