import { Box, Flex, HStack, Text, VStack } from '@vapor-ui/core';

export default function FlexDirection() {
    return (
        <VStack gap="$200">
            <HStack gap="$150" alignItems="center">
                <Text className="w-24" typography="body3" foreground="hint-100">
                    row
                </Text>
                <Flex
                    flexDirection="row"
                    gap="$200"
                    padding="$300"
                    backgroundColor="$gray-100"
                    borderRadius="$200"
                >
                    <Box
                        padding="$200"
                        backgroundColor="$blue-400"
                        borderRadius="$100"
                        color="$contrast-100"
                    >
                        1
                    </Box>
                    <Box
                        padding="$200"
                        backgroundColor="$green-400"
                        borderRadius="$100"
                        color="$contrast-100"
                    >
                        2
                    </Box>
                    <Box
                        padding="$200"
                        backgroundColor="$orange-400"
                        borderRadius="$100"
                        color="$contrast-100"
                    >
                        3
                    </Box>
                </Flex>
            </HStack>

            <HStack gap="$150" alignItems="start">
                <Text className="w-24" typography="body3" foreground="hint-100">
                    column
                </Text>
                <Flex
                    flexDirection="column"
                    gap="$200"
                    padding="$300"
                    backgroundColor="$gray-100"
                    borderRadius="$200"
                >
                    <Box
                        padding="$200"
                        backgroundColor="$blue-400"
                        borderRadius="$100"
                        color="$contrast-100"
                    >
                        1
                    </Box>
                    <Box
                        padding="$200"
                        backgroundColor="$green-400"
                        borderRadius="$100"
                        color="$contrast-100"
                    >
                        2
                    </Box>
                    <Box
                        padding="$200"
                        backgroundColor="$orange-400"
                        borderRadius="$100"
                        color="$contrast-100"
                    >
                        3
                    </Box>
                </Flex>
            </HStack>

            <HStack gap="$150" alignItems="center">
                <Text className="w-24" typography="body3" foreground="hint-100">
                    row-reverse
                </Text>
                <Flex
                    flexDirection="row-reverse"
                    gap="$200"
                    padding="$300"
                    backgroundColor="$gray-100"
                    borderRadius="$200"
                >
                    <Box
                        padding="$200"
                        backgroundColor="$blue-400"
                        borderRadius="$100"
                        color="$contrast-100"
                    >
                        1
                    </Box>
                    <Box
                        padding="$200"
                        backgroundColor="$green-400"
                        borderRadius="$100"
                        color="$contrast-100"
                    >
                        2
                    </Box>
                    <Box
                        padding="$200"
                        backgroundColor="$orange-400"
                        borderRadius="$100"
                        color="$contrast-100"
                    >
                        3
                    </Box>
                </Flex>
            </HStack>
        </VStack>
    );
}
