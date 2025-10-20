import { Box } from '@vapor-ui/core';

export default function BoxBackground() {
    return (
        <div className="flex flex-wrap items-center gap-4">
            <Box padding="$400" backgroundColor="$primary-200" textColor="$primary-100">
                Primary
            </Box>
            <Box padding="$400" backgroundColor="$secondary-200" textColor="$contrast-100">
                Secondary
            </Box>
            <Box padding="$400" backgroundColor="$success-200" textColor="$contrast-100">
                Success
            </Box>
            <Box padding="$400" backgroundColor="$warning-200" textColor="$contrast-100">
                Warning
            </Box>
            <Box padding="$400" backgroundColor="$danger-200" textColor="$contrast-100">
                Danger
            </Box>
            <Box padding="$400" backgroundColor="$gray-200" textColor="$primary-100">
                Gray 200
            </Box>
            <Box padding="$400" backgroundColor="$blue-500" textColor="$contrast-100">
                Blue 500
            </Box>
            <Box padding="$400" backgroundColor="$green-300" textColor="$primary-100">
                Green 300
            </Box>
        </div>
    );
}
