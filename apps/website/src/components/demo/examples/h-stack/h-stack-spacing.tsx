import { Box, HStack, Text, VStack } from '@vapor-ui/core';

export default function HStackSpacing() {
    return (
        <VStack gap="$200">
            <HStack gap="$150" alignItems="center">
                <Text className="w-16" typography="body3" foreground="hint-100">
                    $100
                </Text>
                <HStack gap="$100">
                    <Box backgroundColor="$red-100" padding="$200" borderRadius="$200">
                        A
                    </Box>
                    <Box backgroundColor="$red-100" padding="$200" borderRadius="$200">
                        B
                    </Box>
                    <Box backgroundColor="$red-100" padding="$200" borderRadius="$200">
                        C
                    </Box>
                </HStack>
            </HStack>

            <HStack gap="$150" alignItems="center">
                <Text className="w-16" typography="body3" foreground="hint-100">
                    $400
                </Text>
                <HStack gap="$400">
                    <Box backgroundColor="$orange-100" padding="$200" borderRadius="$200">
                        A
                    </Box>
                    <Box backgroundColor="$orange-100" padding="$200" borderRadius="$200">
                        B
                    </Box>
                    <Box backgroundColor="$orange-100" padding="$200" borderRadius="$200">
                        C
                    </Box>
                </HStack>
            </HStack>

            <HStack gap="$150" alignItems="center">
                <Text className="w-16" typography="body3" foreground="hint-100">
                    $800
                </Text>
                <HStack gap="$800">
                    <Box backgroundColor="$teal-100" padding="$200" borderRadius="$200">
                        A
                    </Box>
                    <Box backgroundColor="$teal-100" padding="$200" borderRadius="$200">
                        B
                    </Box>
                    <Box backgroundColor="$teal-100" padding="$200" borderRadius="$200">
                        C
                    </Box>
                </HStack>
            </HStack>
        </VStack>
    );
}
