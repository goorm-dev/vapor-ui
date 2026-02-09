import { Box, Flex } from '@vapor-ui/core';

export default function DefaultFlex() {
    return (
        <Flex
            $styles={{
                gap: '$200',
                padding: '$300',
                backgroundColor: '$basic-gray-100',
                borderRadius: '$200',
            }}
        >
            <Box
                $styles={{
                    padding: '$200',
                    backgroundColor: '$basic-blue-400',
                    borderRadius: '$100',
                    color: '$fg-contrast-100',
                }}
            >
                Item 1
            </Box>
            <Box
                $styles={{
                    padding: '$200',
                    backgroundColor: '$basic-green-400',
                    borderRadius: '$100',
                    color: '$fg-contrast-100',
                }}
            >
                Item 2
            </Box>
            <Box
                $styles={{
                    padding: '$200',
                    backgroundColor: '$basic-orange-400',
                    borderRadius: '$100',
                    color: '$fg-contrast-100',
                }}
            >
                Item 3
            </Box>
        </Flex>
    );
}
