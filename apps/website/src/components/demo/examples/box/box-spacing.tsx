import { Box, HStack, Text, VStack } from '@vapor-ui/core';

export default function BoxSpacing() {
    return (
        <VStack gap="$200">
            <HStack gap="$150" alignItems="center">
                <Text className="w-28" typography="body3" foreground="hint-100">
                    padding
                </Text>
                <Box padding="$400" backgroundColor="$blue-200" borderRadius="$200">
                    Content with padding
                </Box>
            </HStack>

            <HStack gap="$150" alignItems="center">
                <Text className="w-28" typography="body3" foreground="hint-100">
                    margin
                </Text>
                <Box margin="$400" padding="$300" backgroundColor="$green-200" borderRadius="$200">
                    Content with margin
                </Box>
            </HStack>

            <HStack gap="$150" alignItems="center">
                <Text className="w-28" typography="body3" foreground="hint-100">
                    paddingX/Y
                </Text>
                <Box
                    paddingX="$500"
                    paddingY="$200"
                    backgroundColor="$grape-100"
                    borderRadius="$200"
                >
                    Horizontal padding
                </Box>
            </HStack>

            <HStack gap="$150" alignItems="center">
                <Text className="w-28" typography="body3" foreground="hint-100">
                    marginX/Y
                </Text>
                <Box
                    marginX="$300"
                    marginY="$100"
                    padding="$300"
                    backgroundColor="$grape-200"
                    borderRadius="$200"
                >
                    Asymmetric margins
                </Box>
            </HStack>
        </VStack>
    );
}
