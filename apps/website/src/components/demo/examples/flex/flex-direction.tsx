import { Box, Flex, HStack, Text, VStack } from '@vapor-ui/core';

export default function FlexDirection() {
    return (
        <VStack $css={{ gap: '$200' }}>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-24" typography="body3" foreground="hint-100">
                    row
                </Text>
                <Flex
                    $css={{
                        flexDirection: 'row',
                        gap: '$200',
                        padding: '$300',
                        backgroundColor: '$basic-gray-100',
                        borderRadius: '$200',
                    }}
                >
                    <Box
                        $css={{
                            padding: '$200',
                            backgroundColor: '$basic-blue-400',
                            borderRadius: '$100',
                            color: '$fg-contrast-100',
                        }}
                    >
                        1
                    </Box>
                    <Box
                        $css={{
                            padding: '$200',
                            backgroundColor: '$basic-green-400',
                            borderRadius: '$100',
                            color: '$fg-contrast-100',
                        }}
                    >
                        2
                    </Box>
                    <Box
                        $css={{
                            padding: '$200',
                            backgroundColor: '$basic-orange-400',
                            borderRadius: '$100',
                            color: '$fg-contrast-100',
                        }}
                    >
                        3
                    </Box>
                </Flex>
            </HStack>

            <HStack $css={{ gap: '$150', alignItems: 'start' }}>
                <Text className="w-24" typography="body3" foreground="hint-100">
                    column
                </Text>
                <Flex
                    $css={{
                        flexDirection: 'column',
                        gap: '$200',
                        padding: '$300',
                        backgroundColor: '$basic-gray-100',
                        borderRadius: '$200',
                    }}
                >
                    <Box
                        $css={{
                            padding: '$200',
                            backgroundColor: '$basic-blue-400',
                            borderRadius: '$100',
                            color: '$fg-contrast-100',
                        }}
                    >
                        1
                    </Box>
                    <Box
                        $css={{
                            padding: '$200',
                            backgroundColor: '$basic-green-400',
                            borderRadius: '$100',
                            color: '$fg-contrast-100',
                        }}
                    >
                        2
                    </Box>
                    <Box
                        $css={{
                            padding: '$200',
                            backgroundColor: '$basic-orange-400',
                            borderRadius: '$100',
                            color: '$fg-contrast-100',
                        }}
                    >
                        3
                    </Box>
                </Flex>
            </HStack>

            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-24" typography="body3" foreground="hint-100">
                    row-reverse
                </Text>
                <Flex
                    $css={{
                        flexDirection: 'row-reverse',
                        gap: '$200',
                        padding: '$300',
                        backgroundColor: '$basic-gray-100',
                        borderRadius: '$200',
                    }}
                >
                    <Box
                        $css={{
                            padding: '$200',
                            backgroundColor: '$basic-blue-400',
                            borderRadius: '$100',
                            color: '$fg-contrast-100',
                        }}
                    >
                        1
                    </Box>
                    <Box
                        $css={{
                            padding: '$200',
                            backgroundColor: '$basic-green-400',
                            borderRadius: '$100',
                            color: '$fg-contrast-100',
                        }}
                    >
                        2
                    </Box>
                    <Box
                        $css={{
                            padding: '$200',
                            backgroundColor: '$basic-orange-400',
                            borderRadius: '$100',
                            color: '$fg-contrast-100',
                        }}
                    >
                        3
                    </Box>
                </Flex>
            </HStack>
        </VStack>
    );
}
