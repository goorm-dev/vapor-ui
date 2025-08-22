import { Box } from '@vapor-ui/core';

export default function BoxBackground() {
    return (
        <div className="flex flex-wrap items-center gap-4">
            <Box padding="$400" backgroundColor="primary" foregroundColor="$contrast">
                Primary
            </Box>
            <Box padding="$400" backgroundColor="secondary" foregroundColor="$contrast">
                Secondary
            </Box>
            <Box padding="$400" backgroundColor="success" foregroundColor="$contrast">
                Success
            </Box>
            <Box padding="$400" backgroundColor="warning" foregroundColor="$contrast">
                Warning
            </Box>
            <Box padding="$400" backgroundColor="danger" foregroundColor="$contrast">
                Danger
            </Box>
            <Box padding="$400" backgroundColor="gray-200" foregroundColor="$primary">
                Gray 200
            </Box>
            <Box padding="$400" backgroundColor="blue-500" foregroundColor="$contrast">
                Blue 500
            </Box>
            <Box padding="$400" backgroundColor="green-300" foregroundColor="$primary">
                Green 300
            </Box>
        </div>
    );
}
