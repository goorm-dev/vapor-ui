import { Box, HStack, Text, VStack } from '@vapor-ui/core';

export default function HStackReverse() {
    return (
        <VStack gap="$200">
            <HStack gap="$150" alignItems="center">
                <Text className="w-16" typography="body3" foreground="hint-100">
                    normal
                </Text>
                <HStack gap="$150">
                    <Box backgroundColor="$green-100" padding="$300" borderRadius="$200">
                        First
                    </Box>
                    <Box backgroundColor="$green-200" padding="$300" borderRadius="$200">
                        Second
                    </Box>
                    <Box backgroundColor="$green-300" padding="$300" borderRadius="$200">
                        Third
                    </Box>
                </HStack>
            </HStack>

            <HStack gap="$150" alignItems="center">
                <Text className="w-16" typography="body3" foreground="hint-100">
                    reverse
                </Text>
                <HStack reverse gap="$150">
                    <Box backgroundColor="$purple-100" padding="$300" borderRadius="$200">
                        First
                    </Box>
                    <Box backgroundColor="$purple-200" padding="$300" borderRadius="$200">
                        Second
                    </Box>
                    <Box backgroundColor="$purple-300" padding="$300" borderRadius="$200">
                        Third
                    </Box>
                </HStack>
            </HStack>
        </VStack>
    );
}
