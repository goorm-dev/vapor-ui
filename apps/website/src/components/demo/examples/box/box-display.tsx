import { Box, Text, VStack } from '@vapor-ui/core';

export default function BoxDisplay() {
    return (
        <VStack gap="$300">
            <VStack gap="$150">
                <Text typography="body3" foreground="hint-100">
                    block
                </Text>
                <Box display="block" padding="$300" backgroundColor="$blue-200" borderRadius="$200">
                    Block element takes full width
                </Box>
            </VStack>

            <VStack gap="$150">
                <Text typography="body3" foreground="hint-100">
                    inline
                </Text>
                <Box>
                    <Box
                        display="inline"
                        padding="$200"
                        backgroundColor="$green-200"
                        borderRadius="$200"
                    >
                        Inline
                    </Box>
                    <Text render={<span />}> flows with text </Text>
                    <Box
                        display="inline"
                        padding="$200"
                        backgroundColor="$green-200"
                        borderRadius="$200"
                    >
                        like this
                    </Box>
                </Box>
            </VStack>

            <VStack gap="$150">
                <Text typography="body3" foreground="hint-100">
                    flex
                </Text>
                <Box
                    display="flex"
                    gap="$200"
                    padding="$300"
                    backgroundColor="$grape-200"
                    borderRadius="$200"
                >
                    <Box
                        padding="$200"
                        backgroundColor="$grape-400"
                        borderRadius="$100"
                        color="$contrast-100"
                    >
                        Item 1
                    </Box>
                    <Box
                        padding="$200"
                        backgroundColor="$grape-400"
                        borderRadius="$100"
                        color="$contrast-100"
                    >
                        Item 2
                    </Box>
                    <Box
                        padding="$200"
                        backgroundColor="$grape-400"
                        borderRadius="$100"
                        color="$contrast-100"
                    >
                        Item 3
                    </Box>
                </Box>
            </VStack>

            <VStack gap="$150">
                <Text typography="body3" foreground="hint-100">
                    grid
                </Text>
                <Box
                    display="grid"
                    padding="$300"
                    backgroundColor="$orange-200"
                    borderRadius="$200"
                    gap="$200"
                    style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
                >
                    <Box
                        padding="$200"
                        backgroundColor="$orange-400"
                        borderRadius="$100"
                        color="$contrast-100"
                    >
                        A
                    </Box>
                    <Box
                        padding="$200"
                        backgroundColor="$orange-400"
                        borderRadius="$100"
                        color="$contrast-100"
                    >
                        B
                    </Box>
                    <Box
                        padding="$200"
                        backgroundColor="$orange-400"
                        borderRadius="$100"
                        color="$contrast-100"
                    >
                        C
                    </Box>
                </Box>
            </VStack>
        </VStack>
    );
}
