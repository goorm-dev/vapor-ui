import { Box, HStack, Text, VStack } from '@vapor-ui/core';

export default function HStackAlignment() {
    return (
        <VStack $css={{ gap: '$200' }}>
            <HStack $css={{ gap: '$150', alignItems: 'start' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    start
                </Text>
                <HStack
                    $css={{
                        gap: '$100',
                        alignItems: 'start',
                        height: '$800',
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
                            padding: '$400',
                            borderRadius: '$200',
                        }}
                    >
                        Medium
                    </Box>
                    <Box
                        $css={{
                            backgroundColor: '$basic-blue-300',
                            padding: '$100',
                            borderRadius: '$200',
                        }}
                    >
                        Tiny
                    </Box>
                </HStack>
            </HStack>

            <HStack $css={{ gap: '$150', alignItems: 'start' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    center
                </Text>
                <HStack
                    $css={{
                        gap: '$100',
                        alignItems: 'center',
                        height: '$800',
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
                            padding: '$400',
                            borderRadius: '$200',
                        }}
                    >
                        Medium
                    </Box>
                    <Box
                        $css={{
                            backgroundColor: '$basic-green-300',
                            padding: '$100',
                            borderRadius: '$200',
                        }}
                    >
                        Tiny
                    </Box>
                </HStack>
            </HStack>

            <HStack $css={{ gap: '$150', alignItems: 'start' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    end
                </Text>
                <HStack
                    $css={{
                        gap: '$100',
                        alignItems: 'end',
                        height: '$800',
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
                            padding: '$400',
                            borderRadius: '$200',
                        }}
                    >
                        Medium
                    </Box>
                    <Box
                        $css={{
                            backgroundColor: '$basic-purple-300',
                            padding: '$100',
                            borderRadius: '$200',
                        }}
                    >
                        Tiny
                    </Box>
                </HStack>
            </HStack>
        </VStack>
    );
}
