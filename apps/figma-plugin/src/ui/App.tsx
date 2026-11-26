import { Box } from '@vapor-ui/core';

import { ColorSystemTab } from './features/color-system-tab';

const App = () => {
    return (
        <Box className="bg-white pt-v-100 px-v-250">
            <Box className="pt-v-200">
                <ColorSystemTab />
            </Box>
        </Box>
    );
};

export default App;
