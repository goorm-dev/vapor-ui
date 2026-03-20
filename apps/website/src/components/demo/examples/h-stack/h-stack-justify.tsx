import { Box, HStack, Text, VStack } from '@vapor-ui/core';

export default function HStackJustify() {
    return (
        <VStack $css={{ gap: '$200' }}>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-24" typography="body3" foreground="hint-100">
                    flex-start
                </Text>
                <HStack
                    $css={{
                        gap: '$100',
                        justifyContent: 'flex-start',
                        width: '$2400',
                        backgroundColor: '$basic-gray-100',
                        padding: '$200',
                        borderRadius: '$200',
                    }}
                >
                    <Box
                        $css={{
                            backgroundColor: '$basic-red-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        A
                    </Box>
                    <Box
                        $css={{
                            backgroundColor: '$basic-red-200',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        B
                    </Box>
                    <Box
                        $css={{
                            backgroundColor: '$basic-red-300',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        C
                    </Box>
                </HStack>
            </HStack>

            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-24" typography="body3" foreground="hint-100">
                    center
                </Text>
                <HStack
                    $css={{
                        gap: '$100',
                        justifyContent: 'center',
                        width: '$2400',
                        backgroundColor: '$basic-gray-100',
                        padding: '$200',
                        borderRadius: '$200',
                    }}
                >
                    <Box
                        $css={{
                            backgroundColor: '$basic-yellow-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        A
                    </Box>
                    <Box
                        $css={{
                            backgroundColor: '$basic-yellow-200',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        B
                    </Box>
                    <Box
                        $css={{
                            backgroundColor: '$basic-yellow-300',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        C
                    </Box>
                </HStack>
            </HStack>

            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-24" typography="body3" foreground="hint-100">
                    space-between
                </Text>
                <HStack
                    $css={{
                        gap: '$100',
                        justifyContent: 'space-between',
                        width: '$2400',
                        backgroundColor: '$basic-gray-100',
                        padding: '$200',
                        borderRadius: '$200',
                    }}
                >
                    <Box
                        $css={{
                            backgroundColor: '$indigo-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        A
                    </Box>
                    <Box
                        $css={{
                            backgroundColor: '$indigo-200',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        B
                    </Box>
                    <Box
                        $css={{
                            backgroundColor: '$indigo-300',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        C
                    </Box>
                </HStack>
            </HStack>
        </VStack>
    );
}
