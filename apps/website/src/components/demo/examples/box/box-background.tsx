import { Box, HStack } from '@vapor-ui/core';

export default function BoxBackground() {
    return (
        <HStack gap="$200" className="flex-wrap">
            <Box padding="$400" backgroundColor="$primary-200" color="$primary-100">
                Primary
            </Box>
            <Box padding="$400" backgroundColor="$secondary-200" color="$contrast-100">
                Secondary
            </Box>
            <Box padding="$400" backgroundColor="$success-200" color="$contrast-100">
                Success
            </Box>
            <Box padding="$400" backgroundColor="$warning-200" color="$contrast-100">
                Warning
            </Box>
            <Box padding="$400" backgroundColor="$danger-200" color="$contrast-100">
                Danger
            </Box>
            <Box padding="$400" backgroundColor="$gray-200" color="$primary-100">
                Gray
            </Box>
            <Box padding="$400" backgroundColor="$blue-500" color="$contrast-100">
                Blue
            </Box>
            <Box padding="$400" backgroundColor="$green-300" color="$primary-100">
                Green
            </Box>
        </HStack>
    );
}
