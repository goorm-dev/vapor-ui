import { Box, HStack } from '@vapor-ui/core';

export default function DefaultHStack() {
    return (
        <HStack gap="$200">
            <Box backgroundColor="$blue-100" padding="$400" borderRadius="$200">
                Item 1
            </Box>
            <Box backgroundColor="$blue-100" padding="$400" borderRadius="$200">
                Item 2
            </Box>
            <Box backgroundColor="$blue-100" padding="$400" borderRadius="$200">
                Item 3
            </Box>
        </HStack>
    );
}
