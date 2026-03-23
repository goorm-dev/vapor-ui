import { Box, HStack } from '@vapor-ui/core';

export default function DefaultHStack() {
    return (
        <HStack $css={{ gap: '$200' }}>
            <Box
                $css={{
                    backgroundColor: '$basic-blue-100',
                    padding: '$400',
                    borderRadius: '$200',
                }}
            >
                Item 1
            </Box>
            <Box
                $css={{
                    backgroundColor: '$basic-blue-100',
                    padding: '$400',
                    borderRadius: '$200',
                }}
            >
                Item 2
            </Box>
            <Box
                $css={{
                    backgroundColor: '$basic-blue-100',
                    padding: '$400',
                    borderRadius: '$200',
                }}
            >
                Item 3
            </Box>
        </HStack>
    );
}
