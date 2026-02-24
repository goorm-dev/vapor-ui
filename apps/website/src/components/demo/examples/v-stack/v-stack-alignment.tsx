import { Box, HStack, Text, VStack } from '@vapor-ui/core';

export default function VStackAlignment() {
    return (
        <HStack $css={{ gap: '$400', alignItems: 'start' }}>
            <VStack $css={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    start
                </Text>
                <VStack
                    $css={{
                        gap: '$100',
                        alignItems: 'start',
                        width: '$1600',
                        backgroundColor: '$basic-gray-100',
                        padding: '$200',
                        borderRadius: '$200',
                    }}
                >
                    <Box
                        $css={{
                            backgroundColor: '$basic-blue-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        Short
                    </Box>
                    <Box
                        $css={{
                            backgroundColor: '$basic-blue-200',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        Medium Width
                    </Box>
                    <Box
                        $css={{
                            backgroundColor: '$basic-blue-300',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        Tiny
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
                        alignItems: 'center',
                        width: '$1600',
                        backgroundColor: '$basic-gray-100',
                        padding: '$200',
                        borderRadius: '$200',
                    }}
                >
                    <Box
                        $css={{
                            backgroundColor: '$basic-green-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        Short
                    </Box>
                    <Box
                        $css={{
                            backgroundColor: '$basic-green-200',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        Medium Width
                    </Box>
                    <Box
                        $css={{
                            backgroundColor: '$basic-green-300',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        Tiny
                    </Box>
                </VStack>
            </VStack>

            <VStack $css={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    end
                </Text>
                <VStack
                    $css={{
                        gap: '$100',
                        alignItems: 'end',
                        width: '$1600',
                        backgroundColor: '$basic-gray-100',
                        padding: '$200',
                        borderRadius: '$200',
                    }}
                >
                    <Box
                        $css={{
                            backgroundColor: '$basic-purple-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        Short
                    </Box>
                    <Box
                        $css={{
                            backgroundColor: '$basic-purple-200',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        Medium Width
                    </Box>
                    <Box
                        $css={{
                            backgroundColor: '$basic-purple-300',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        Tiny
                    </Box>
                </VStack>
            </VStack>
        </HStack>
    );
}
