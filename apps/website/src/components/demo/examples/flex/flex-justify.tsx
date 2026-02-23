import { Box, Flex, HStack, Text, VStack } from '@vapor-ui/core';

export default function FlexJustify() {
    return (
        <VStack $css={{ gap: '$200' }}>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-24" typography="body3" foreground="hint-100">
                    flex-start
                </Text>
                <Flex
                    $css={{
                        justifyContent: 'flex-start',
                        gap: '$200',
                        padding: '$300',
                        backgroundColor: '$basic-gray-100',
                        borderRadius: '$200',
                        width: '$2400',
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
                        A
                    </Box>
                    <Box
                        $css={{
                            padding: '$200',
                            backgroundColor: '$basic-green-400',
                            borderRadius: '$100',
                            color: '$fg-contrast-100',
                        }}
                    >
                        B
                    </Box>
                </Flex>
            </HStack>

            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-24" typography="body3" foreground="hint-100">
                    center
                </Text>
                <Flex
                    $css={{
                        justifyContent: 'center',
                        gap: '$200',
                        padding: '$300',
                        backgroundColor: '$basic-gray-100',
                        borderRadius: '$200',
                        width: '$2400',
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
                        A
                    </Box>
                    <Box
                        $css={{
                            padding: '$200',
                            backgroundColor: '$basic-green-400',
                            borderRadius: '$100',
                            color: '$fg-contrast-100',
                        }}
                    >
                        B
                    </Box>
                </Flex>
            </HStack>

            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-24" typography="body3" foreground="hint-100">
                    flex-end
                </Text>
                <Flex
                    $css={{
                        justifyContent: 'flex-end',
                        gap: '$200',
                        padding: '$300',
                        backgroundColor: '$basic-gray-100',
                        borderRadius: '$200',
                        width: '$2400',
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
                        A
                    </Box>
                    <Box
                        $css={{
                            padding: '$200',
                            backgroundColor: '$basic-green-400',
                            borderRadius: '$100',
                            color: '$fg-contrast-100',
                        }}
                    >
                        B
                    </Box>
                </Flex>
            </HStack>

            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-24" typography="body3" foreground="hint-100">
                    space-between
                </Text>
                <Flex
                    $css={{
                        justifyContent: 'space-between',
                        gap: '$200',
                        padding: '$300',
                        backgroundColor: '$basic-gray-100',
                        borderRadius: '$200',
                        width: '$2400',
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
                        A
                    </Box>
                    <Box
                        $css={{
                            padding: '$200',
                            backgroundColor: '$basic-green-400',
                            borderRadius: '$100',
                            color: '$fg-contrast-100',
                        }}
                    >
                        B
                    </Box>
                    <Box
                        $css={{
                            padding: '$200',
                            backgroundColor: '$basic-orange-400',
                            borderRadius: '$100',
                            color: '$fg-contrast-100',
                        }}
                    >
                        C
                    </Box>
                </Flex>
            </HStack>
        </VStack>
    );
}
