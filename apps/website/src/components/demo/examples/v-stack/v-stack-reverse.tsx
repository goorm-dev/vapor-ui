import { Box, HStack, Text, VStack } from '@vapor-ui/core';

export default function VStackReverse() {
    return (
        <HStack gap="$400" alignItems="start">
            <VStack gap="$150">
                <Text typography="body3" foreground="hint-100">
                    normal
                </Text>
                <VStack gap="$150">
                    <Box backgroundColor="$green-100" padding="$300" borderRadius="$200">
                        First
                    </Box>
                    <Box backgroundColor="$green-200" padding="$300" borderRadius="$200">
                        Second
                    </Box>
                    <Box backgroundColor="$green-300" padding="$300" borderRadius="$200">
                        Third
                    </Box>
                </VStack>
            </VStack>

            <VStack gap="$150">
                <Text typography="body3" foreground="hint-100">
                    reverse
                </Text>
                <VStack reverse gap="$150">
                    <Box backgroundColor="$purple-100" padding="$300" borderRadius="$200">
                        First
                    </Box>
                    <Box backgroundColor="$purple-200" padding="$300" borderRadius="$200">
                        Second
                    </Box>
                    <Box backgroundColor="$purple-300" padding="$300" borderRadius="$200">
                        Third
                    </Box>
                </VStack>
            </VStack>
        </HStack>
    );
}
