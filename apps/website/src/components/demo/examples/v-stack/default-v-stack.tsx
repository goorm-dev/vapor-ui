import { Box, VStack } from '@vapor-ui/core';

export default function DefaultVStack() {
    return (
        <VStack $styles={{ gap: '$200' }}>
            <Box $styles={{ backgroundColor: '$blue-100', padding: '$400', borderRadius: '$200' }}>
                Item 1
            </Box>
            <Box $styles={{ backgroundColor: '$blue-100', padding: '$400', borderRadius: '$200' }}>
                Item 2
            </Box>
            <Box $styles={{ backgroundColor: '$blue-100', padding: '$400', borderRadius: '$200' }}>
                Item 3
            </Box>
        </VStack>
    );
}
