import { Box, HStack, Text, VStack } from '@vapor-ui/core';

export default function VStackJustify() {
    return (
        <HStack $css={{ gap: '$400', alignItems: 'start' }}>
            <VStack $css={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    flex-start
                </Text>
                <VStack
                    $css={{
                        gap: '$100',
                        justifyContent: 'flex-start',
                        height: '$1600',
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
                </VStack>
            </VStack>

            <VStack $css={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    center
                </Text>
                <VStack
                    $css={{
                        gap: '$100',
                        justifyContent: 'center',
                        height: '$1600',
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
                </VStack>
            </VStack>

            <VStack $css={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    space-between
                </Text>
                <VStack
                    $css={{
                        gap: '$100',
                        justifyContent: 'space-between',
                        height: '$1600',
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
                </VStack>
            </VStack>
        </HStack>
    );
}
