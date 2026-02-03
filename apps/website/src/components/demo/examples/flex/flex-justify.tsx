import { Box, Flex, HStack, Text, VStack } from '@vapor-ui/core';

export default function FlexJustify() {
    return (
        <VStack gap="$200">
            <HStack gap="$150" alignItems="center">
                <Text className="w-24" typography="body3" foreground="hint-100">
                    flex-start
                </Text>
                <Flex
                    justifyContent="flex-start"
                    gap="$200"
                    padding="$300"
                    backgroundColor="$gray-100"
                    borderRadius="$200"
                    width="$2400"
                >
                    <Box
                        padding="$200"
                        backgroundColor="$blue-400"
                        borderRadius="$100"
                        color="$contrast-100"
                    >
                        A
                    </Box>
                    <Box
                        padding="$200"
                        backgroundColor="$green-400"
                        borderRadius="$100"
                        color="$contrast-100"
                    >
                        B
                    </Box>
                </Flex>
            </HStack>

            <HStack gap="$150" alignItems="center">
                <Text className="w-24" typography="body3" foreground="hint-100">
                    center
                </Text>
                <Flex
                    justifyContent="center"
                    gap="$200"
                    padding="$300"
                    backgroundColor="$gray-100"
                    borderRadius="$200"
                    width="$2400"
                >
                    <Box
                        padding="$200"
                        backgroundColor="$blue-400"
                        borderRadius="$100"
                        color="$contrast-100"
                    >
                        A
                    </Box>
                    <Box
                        padding="$200"
                        backgroundColor="$green-400"
                        borderRadius="$100"
                        color="$contrast-100"
                    >
                        B
                    </Box>
                </Flex>
            </HStack>

            <HStack gap="$150" alignItems="center">
                <Text className="w-24" typography="body3" foreground="hint-100">
                    flex-end
                </Text>
                <Flex
                    justifyContent="flex-end"
                    gap="$200"
                    padding="$300"
                    backgroundColor="$gray-100"
                    borderRadius="$200"
                    width="$2400"
                >
                    <Box
                        padding="$200"
                        backgroundColor="$blue-400"
                        borderRadius="$100"
                        color="$contrast-100"
                    >
                        A
                    </Box>
                    <Box
                        padding="$200"
                        backgroundColor="$green-400"
                        borderRadius="$100"
                        color="$contrast-100"
                    >
                        B
                    </Box>
                </Flex>
            </HStack>

            <HStack gap="$150" alignItems="center">
                <Text className="w-24" typography="body3" foreground="hint-100">
                    space-between
                </Text>
                <Flex
                    justifyContent="space-between"
                    gap="$200"
                    padding="$300"
                    backgroundColor="$gray-100"
                    borderRadius="$200"
                    width="$2400"
                >
                    <Box
                        padding="$200"
                        backgroundColor="$blue-400"
                        borderRadius="$100"
                        color="$contrast-100"
                    >
                        A
                    </Box>
                    <Box
                        padding="$200"
                        backgroundColor="$green-400"
                        borderRadius="$100"
                        color="$contrast-100"
                    >
                        B
                    </Box>
                    <Box
                        padding="$200"
                        backgroundColor="$orange-400"
                        borderRadius="$100"
                        color="$contrast-100"
                    >
                        C
                    </Box>
                </Flex>
            </HStack>
        </VStack>
    );
}
