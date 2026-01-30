import { Box, HStack, Text, VStack } from '@vapor-ui/core';

export default function HStackAlignment() {
    return (
        <VStack gap="$200">
            <HStack gap="$150" alignItems="start">
                <Text className="w-16" typography="body3" foreground="hint-100">
                    start
                </Text>
                <HStack
                    gap="$100"
                    alignItems="start"
                    height="$800"
                    backgroundColor="$gray-100"
                    padding="$200"
                    borderRadius="$200"
                >
                    <Box backgroundColor="$blue-100" padding="$200" borderRadius="$200">
                        Short
                    </Box>
                    <Box backgroundColor="$blue-200" padding="$400" borderRadius="$200">
                        Medium
                    </Box>
                    <Box backgroundColor="$blue-300" padding="$100" borderRadius="$200">
                        Tiny
                    </Box>
                </HStack>
            </HStack>

            <HStack gap="$150" alignItems="start">
                <Text className="w-16" typography="body3" foreground="hint-100">
                    center
                </Text>
                <HStack
                    gap="$100"
                    alignItems="center"
                    height="$800"
                    backgroundColor="$gray-100"
                    padding="$200"
                    borderRadius="$200"
                >
                    <Box backgroundColor="$green-100" padding="$200" borderRadius="$200">
                        Short
                    </Box>
                    <Box backgroundColor="$green-200" padding="$400" borderRadius="$200">
                        Medium
                    </Box>
                    <Box backgroundColor="$green-300" padding="$100" borderRadius="$200">
                        Tiny
                    </Box>
                </HStack>
            </HStack>

            <HStack gap="$150" alignItems="start">
                <Text className="w-16" typography="body3" foreground="hint-100">
                    end
                </Text>
                <HStack
                    gap="$100"
                    alignItems="end"
                    height="$800"
                    backgroundColor="$gray-100"
                    padding="$200"
                    borderRadius="$200"
                >
                    <Box backgroundColor="$purple-100" padding="$200" borderRadius="$200">
                        Short
                    </Box>
                    <Box backgroundColor="$purple-200" padding="$400" borderRadius="$200">
                        Medium
                    </Box>
                    <Box backgroundColor="$purple-300" padding="$100" borderRadius="$200">
                        Tiny
                    </Box>
                </HStack>
            </HStack>
        </VStack>
    );
}
