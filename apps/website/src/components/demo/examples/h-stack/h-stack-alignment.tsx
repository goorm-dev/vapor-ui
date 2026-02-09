import { Box, HStack, Text, VStack } from '@vapor-ui/core';

export default function HStackAlignment() {
    return (
        <VStack $styles={{ gap: '$200' }}>
            <HStack $styles={{ gap: '$150', alignItems: 'start' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    start
                </Text>
                <HStack
                    $styles={{
                        gap: '$100',
                        alignItems: 'start',
                        height: '$800',
                        backgroundColor: '$gray-100',
                        padding: '$200',
                        borderRadius: '$200',
                    }}
                >
                    <Box
                        $styles={{
                            backgroundColor: '$blue-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        Short
                    </Box>
                    <Box
                        $styles={{
                            backgroundColor: '$blue-200',
                            padding: '$400',
                            borderRadius: '$200',
                        }}
                    >
                        Medium
                    </Box>
                    <Box
                        $styles={{
                            backgroundColor: '$blue-300',
                            padding: '$100',
                            borderRadius: '$200',
                        }}
                    >
                        Tiny
                    </Box>
                </HStack>
            </HStack>

            <HStack $styles={{ gap: '$150', alignItems: 'start' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    center
                </Text>
                <HStack
                    $styles={{
                        gap: '$100',
                        alignItems: 'center',
                        height: '$800',
                        backgroundColor: '$gray-100',
                        padding: '$200',
                        borderRadius: '$200',
                    }}
                >
                    <Box
                        $styles={{
                            backgroundColor: '$green-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        Short
                    </Box>
                    <Box
                        $styles={{
                            backgroundColor: '$green-200',
                            padding: '$400',
                            borderRadius: '$200',
                        }}
                    >
                        Medium
                    </Box>
                    <Box
                        $styles={{
                            backgroundColor: '$green-300',
                            padding: '$100',
                            borderRadius: '$200',
                        }}
                    >
                        Tiny
                    </Box>
                </HStack>
            </HStack>

            <HStack $styles={{ gap: '$150', alignItems: 'start' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    end
                </Text>
                <HStack
                    $styles={{
                        gap: '$100',
                        alignItems: 'end',
                        height: '$800',
                        backgroundColor: '$gray-100',
                        padding: '$200',
                        borderRadius: '$200',
                    }}
                >
                    <Box
                        $styles={{
                            backgroundColor: '$purple-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        Short
                    </Box>
                    <Box
                        $styles={{
                            backgroundColor: '$purple-200',
                            padding: '$400',
                            borderRadius: '$200',
                        }}
                    >
                        Medium
                    </Box>
                    <Box
                        $styles={{
                            backgroundColor: '$purple-300',
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
