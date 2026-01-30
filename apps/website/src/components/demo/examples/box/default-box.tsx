import { Box, Text } from '@vapor-ui/core';

export default function DefaultBox() {
    return (
        <Box padding="$400" backgroundColor="$gray-100" borderRadius="$300">
            <Text>Basic Box with padding, background, and border radius</Text>
        </Box>
    );
}
