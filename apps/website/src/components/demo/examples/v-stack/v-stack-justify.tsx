import { Box, HStack, Text, VStack } from '@vapor-ui/core';

export default function VStackJustify() {
    return (
        <HStack gap="$400" alignItems="start">
            <VStack gap="$150">
                <Text typography="body3" foreground="hint-100">
                    flex-start
                </Text>
                <VStack
                    gap="$100"
                    justifyContent="flex-start"
                    height="$1600"
                    backgroundColor="$gray-100"
                    padding="$200"
                    borderRadius="$200"
                >
                    <Box backgroundColor="$red-100" padding="$200" borderRadius="$200">
                        A
                    </Box>
                    <Box backgroundColor="$red-200" padding="$200" borderRadius="$200">
                        B
                    </Box>
                    <Box backgroundColor="$red-300" padding="$200" borderRadius="$200">
                        C
                    </Box>
                </VStack>
            </VStack>

            <VStack gap="$150">
                <Text typography="body3" foreground="hint-100">
                    center
                </Text>
                <VStack
                    gap="$100"
                    justifyContent="center"
                    height="$1600"
                    backgroundColor="$gray-100"
                    padding="$200"
                    borderRadius="$200"
                >
                    <Box backgroundColor="$yellow-100" padding="$200" borderRadius="$200">
                        A
                    </Box>
                    <Box backgroundColor="$yellow-200" padding="$200" borderRadius="$200">
                        B
                    </Box>
                    <Box backgroundColor="$yellow-300" padding="$200" borderRadius="$200">
                        C
                    </Box>
                </VStack>
            </VStack>

            <VStack gap="$150">
                <Text typography="body3" foreground="hint-100">
                    space-between
                </Text>
                <VStack
                    gap="$100"
                    justifyContent="space-between"
                    height="$1600"
                    backgroundColor="$gray-100"
                    padding="$200"
                    borderRadius="$200"
                >
                    <Box backgroundColor="$indigo-100" padding="$200" borderRadius="$200">
                        A
                    </Box>
                    <Box backgroundColor="$indigo-200" padding="$200" borderRadius="$200">
                        B
                    </Box>
                    <Box backgroundColor="$indigo-300" padding="$200" borderRadius="$200">
                        C
                    </Box>
                </VStack>
            </VStack>
        </HStack>
    );
}
