import { Box, HStack, Text, VStack } from '@vapor-ui/core';

export default function BoxVisual() {
    return (
        <VStack gap="$300">
            <VStack gap="$150">
                <Text typography="body3" foreground="hint-100">
                    borderRadius
                </Text>
                <HStack gap="$200" alignItems="center">
                    <Box padding="$400" backgroundColor="$blue-200" borderRadius="$100">
                        Small
                    </Box>
                    <Box padding="$400" backgroundColor="$blue-300" borderRadius="$300">
                        Medium
                    </Box>
                    <Box padding="$400" backgroundColor="$blue-400" borderRadius="$600">
                        Large
                    </Box>
                    <Box
                        padding="$400"
                        backgroundColor="$blue-500"
                        borderRadius="$900"
                        color="$contrast-100"
                    >
                        Extra Large
                    </Box>
                </HStack>
            </VStack>

            <VStack gap="$150">
                <Text typography="body3" foreground="hint-100">
                    opacity
                </Text>
                <HStack gap="$200" alignItems="center">
                    <Box
                        padding="$400"
                        backgroundColor="$green-500"
                        opacity="0.3"
                        borderRadius="$200"
                    >
                        30%
                    </Box>
                    <Box
                        padding="$400"
                        backgroundColor="$green-500"
                        opacity="0.6"
                        borderRadius="$200"
                    >
                        60%
                    </Box>
                    <Box
                        padding="$400"
                        backgroundColor="$green-500"
                        opacity="0.9"
                        borderRadius="$200"
                    >
                        90%
                    </Box>
                    <Box padding="$400" backgroundColor="$green-500" borderRadius="$200">
                        100%
                    </Box>
                </HStack>
            </VStack>

            <VStack gap="$150">
                <Text typography="body3" foreground="hint-100">
                    textAlign
                </Text>
                <VStack gap="$100">
                    <Box
                        padding="$400"
                        backgroundColor="$grape-100"
                        borderRadius="$200"
                        textAlign="left"
                    >
                        Left aligned
                    </Box>
                    <Box
                        padding="$400"
                        backgroundColor="$grape-200"
                        borderRadius="$200"
                        textAlign="center"
                    >
                        Center aligned
                    </Box>
                    <Box
                        padding="$400"
                        backgroundColor="$grape-300"
                        borderRadius="$200"
                        textAlign="right"
                    >
                        Right aligned
                    </Box>
                </VStack>
            </VStack>

            <VStack gap="$150">
                <Text typography="body3" foreground="hint-100">
                    overflow
                </Text>
                <VStack gap="$200">
                    <Box
                        height="$800"
                        padding="$300"
                        backgroundColor="$orange-200"
                        borderRadius="$200"
                        overflow="hidden"
                    >
                        This text will be clipped when it overflows the container bounds because
                        overflow is set to hidden.
                    </Box>
                    <Box
                        height="$300"
                        padding="$300"
                        backgroundColor="$orange-300"
                        borderRadius="$200"
                        overflow="scroll"
                    >
                        This text will show scrollbars when it overflows the container bounds
                        because overflow is set to scroll.
                    </Box>
                </VStack>
            </VStack>
        </VStack>
    );
}
