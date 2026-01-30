import { Box, HStack, Text, VStack } from '@vapor-ui/core';

export default function VStackSpacing() {
    return (
        <HStack gap="$400" alignItems="start">
            <VStack gap="$150">
                <Text typography="body3" foreground="hint-100">
                    $100
                </Text>
                <VStack gap="$100">
                    <Box backgroundColor="$red-100" padding="$200" borderRadius="$200">
                        A
                    </Box>
                    <Box backgroundColor="$red-100" padding="$200" borderRadius="$200">
                        B
                    </Box>
                    <Box backgroundColor="$red-100" padding="$200" borderRadius="$200">
                        C
                    </Box>
                </VStack>
            </VStack>

            <VStack gap="$150">
                <Text typography="body3" foreground="hint-100">
                    $400
                </Text>
                <VStack gap="$400">
                    <Box backgroundColor="$orange-100" padding="$200" borderRadius="$200">
                        A
                    </Box>
                    <Box backgroundColor="$orange-100" padding="$200" borderRadius="$200">
                        B
                    </Box>
                    <Box backgroundColor="$orange-100" padding="$200" borderRadius="$200">
                        C
                    </Box>
                </VStack>
            </VStack>

            <VStack gap="$150">
                <Text typography="body3" foreground="hint-100">
                    $800
                </Text>
                <VStack gap="$800">
                    <Box backgroundColor="$teal-100" padding="$200" borderRadius="$200">
                        A
                    </Box>
                    <Box backgroundColor="$teal-100" padding="$200" borderRadius="$200">
                        B
                    </Box>
                    <Box backgroundColor="$teal-100" padding="$200" borderRadius="$200">
                        C
                    </Box>
                </VStack>
            </VStack>
        </HStack>
    );
}
