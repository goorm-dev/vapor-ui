import { Box, HStack, Text, VStack } from '@vapor-ui/core';

export default function HStackJustify() {
    return (
        <VStack gap="$200">
            <HStack gap="$150" alignItems="center">
                <Text className="w-24" typography="body3" foreground="hint-100">
                    flex-start
                </Text>
                <HStack
                    gap="$100"
                    justifyContent="flex-start"
                    width="$2400"
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
                </HStack>
            </HStack>

            <HStack gap="$150" alignItems="center">
                <Text className="w-24" typography="body3" foreground="hint-100">
                    center
                </Text>
                <HStack
                    gap="$100"
                    justifyContent="center"
                    width="$2400"
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
                </HStack>
            </HStack>

            <HStack gap="$150" alignItems="center">
                <Text className="w-24" typography="body3" foreground="hint-100">
                    space-between
                </Text>
                <HStack
                    gap="$100"
                    justifyContent="space-between"
                    width="$2400"
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
                </HStack>
            </HStack>
        </VStack>
    );
}
