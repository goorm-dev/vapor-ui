import { Box, Flex } from '@vapor-ui/core';

export default function DefaultFlex() {
    return (
        <Flex gap="$200" padding="$300" backgroundColor="$gray-100" borderRadius="$200">
            <Box
                padding="$200"
                backgroundColor="$blue-400"
                borderRadius="$100"
                color="$contrast-100"
            >
                Item 1
            </Box>
            <Box
                padding="$200"
                backgroundColor="$green-400"
                borderRadius="$100"
                color="$contrast-100"
            >
                Item 2
            </Box>
            <Box
                padding="$200"
                backgroundColor="$orange-400"
                borderRadius="$100"
                color="$contrast-100"
            >
                Item 3
            </Box>
        </Flex>
    );
}
