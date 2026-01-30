import { Box, HStack, Text, VStack } from '@vapor-ui/core';

export default function VStackAlignment() {
    return (
        <HStack gap="$400" alignItems="start">
            <VStack gap="$150">
                <Text typography="body3" foreground="hint-100">
                    start
                </Text>
                <VStack
                    gap="$100"
                    alignItems="start"
                    width="$1600"
                    backgroundColor="$gray-100"
                    padding="$200"
                    borderRadius="$200"
                >
                    <Box backgroundColor="$blue-100" padding="$200" borderRadius="$200">
                        Short
                    </Box>
                    <Box backgroundColor="$blue-200" padding="$200" borderRadius="$200">
                        Medium Width
                    </Box>
                    <Box backgroundColor="$blue-300" padding="$200" borderRadius="$200">
                        Tiny
                    </Box>
                </VStack>
            </VStack>

            <VStack gap="$150">
                <Text typography="body3" foreground="hint-100">
                    center
                </Text>
                <VStack
                    gap="$100"
                    alignItems="center"
                    width="$1600"
                    backgroundColor="$gray-100"
                    padding="$200"
                    borderRadius="$200"
                >
                    <Box backgroundColor="$green-100" padding="$200" borderRadius="$200">
                        Short
                    </Box>
                    <Box backgroundColor="$green-200" padding="$200" borderRadius="$200">
                        Medium Width
                    </Box>
                    <Box backgroundColor="$green-300" padding="$200" borderRadius="$200">
                        Tiny
                    </Box>
                </VStack>
            </VStack>

            <VStack gap="$150">
                <Text typography="body3" foreground="hint-100">
                    end
                </Text>
                <VStack
                    gap="$100"
                    alignItems="end"
                    width="$1600"
                    backgroundColor="$gray-100"
                    padding="$200"
                    borderRadius="$200"
                >
                    <Box backgroundColor="$purple-100" padding="$200" borderRadius="$200">
                        Short
                    </Box>
                    <Box backgroundColor="$purple-200" padding="$200" borderRadius="$200">
                        Medium Width
                    </Box>
                    <Box backgroundColor="$purple-300" padding="$200" borderRadius="$200">
                        Tiny
                    </Box>
                </VStack>
            </VStack>
        </HStack>
    );
}
