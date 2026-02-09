import { Box, Text } from '@vapor-ui/core';

export default function DefaultBox() {
    return (
        <Box
            $styles={{
                padding: '$400',
                backgroundColor: '$basic-gray-100',
                borderRadius: '$300',
            }}
        >
            <Text>Basic Box with padding, background, and border radius</Text>
        </Box>
    );
}
