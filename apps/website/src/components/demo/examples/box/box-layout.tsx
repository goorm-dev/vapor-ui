import { Box, HStack, Text, VStack } from '@vapor-ui/core';

export default function BoxLayout() {
    return (
        <VStack gap="$300">
            <VStack gap="$150">
                <Text typography="body3" foreground="hint-100">
                    flexDirection
                </Text>
                <VStack gap="$200">
                    <HStack gap="$150" alignItems="center">
                        <Text className="w-24" typography="body3" foreground="hint-100">
                            row
                        </Text>
                        <Box
                            display="flex"
                            flexDirection="row"
                            gap="$200"
                            padding="$300"
                            backgroundColor="$gray-100"
                            borderRadius="$200"
                        >
                            <Box padding="$200" backgroundColor="$blue-300" borderRadius="$100">
                                1
                            </Box>
                            <Box padding="$200" backgroundColor="$blue-300" borderRadius="$100">
                                2
                            </Box>
                            <Box padding="$200" backgroundColor="$blue-300" borderRadius="$100">
                                3
                            </Box>
                        </Box>
                    </HStack>
                    <HStack gap="$150" alignItems="start">
                        <Text className="w-24" typography="body3" foreground="hint-100">
                            column
                        </Text>
                        <Box
                            display="flex"
                            flexDirection="column"
                            gap="$200"
                            padding="$300"
                            backgroundColor="$gray-100"
                            borderRadius="$200"
                        >
                            <Box padding="$200" backgroundColor="$green-300" borderRadius="$100">
                                A
                            </Box>
                            <Box padding="$200" backgroundColor="$green-300" borderRadius="$100">
                                B
                            </Box>
                            <Box padding="$200" backgroundColor="$green-300" borderRadius="$100">
                                C
                            </Box>
                        </Box>
                    </HStack>
                </VStack>
            </VStack>

            <VStack gap="$150">
                <Text typography="body3" foreground="hint-100">
                    justifyContent
                </Text>
                <VStack gap="$200">
                    <HStack gap="$150" alignItems="center">
                        <Text className="w-24" typography="body3" foreground="hint-100">
                            flex-start
                        </Text>
                        <Box
                            display="flex"
                            justifyContent="flex-start"
                            gap="$200"
                            padding="$300"
                            backgroundColor="$gray-100"
                            borderRadius="$200"
                            width="$2400"
                        >
                            <Box padding="$200" backgroundColor="$grape-300" borderRadius="$100">
                                Start
                            </Box>
                            <Box padding="$200" backgroundColor="$grape-300" borderRadius="$100">
                                Items
                            </Box>
                        </Box>
                    </HStack>
                    <HStack gap="$150" alignItems="center">
                        <Text className="w-24" typography="body3" foreground="hint-100">
                            center
                        </Text>
                        <Box
                            display="flex"
                            justifyContent="center"
                            gap="$200"
                            padding="$300"
                            backgroundColor="$gray-100"
                            borderRadius="$200"
                            width="$2400"
                        >
                            <Box padding="$200" backgroundColor="$grape-300" borderRadius="$100">
                                Center
                            </Box>
                            <Box padding="$200" backgroundColor="$grape-300" borderRadius="$100">
                                Items
                            </Box>
                        </Box>
                    </HStack>
                    <HStack gap="$150" alignItems="center">
                        <Text className="w-24" typography="body3" foreground="hint-100">
                            space-between
                        </Text>
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            gap="$200"
                            padding="$300"
                            backgroundColor="$gray-100"
                            borderRadius="$200"
                            width="$2400"
                        >
                            <Box padding="$200" backgroundColor="$grape-300" borderRadius="$100">
                                Space
                            </Box>
                            <Box padding="$200" backgroundColor="$grape-300" borderRadius="$100">
                                Between
                            </Box>
                        </Box>
                    </HStack>
                </VStack>
            </VStack>

            <VStack gap="$150">
                <Text typography="body3" foreground="hint-100">
                    alignItems
                </Text>
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-around"
                    gap="$200"
                    padding="$300"
                    backgroundColor="$gray-100"
                    borderRadius="$200"
                    height="$800"
                >
                    <Box
                        padding="$200"
                        backgroundColor="$orange-300"
                        borderRadius="$100"
                        height="$500"
                    >
                        Small
                    </Box>
                    <Box
                        padding="$200"
                        backgroundColor="$orange-300"
                        borderRadius="$100"
                        height="$600"
                    >
                        Medium
                    </Box>
                    <Box
                        padding="$200"
                        backgroundColor="$orange-300"
                        borderRadius="$100"
                        height="$700"
                    >
                        Aligned
                    </Box>
                </Box>
            </VStack>
        </VStack>
    );
}
