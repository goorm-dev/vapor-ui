import { Box, HStack, Text, VStack } from '@vapor-ui/core';

export default function VStackAlignment() {
    return (
        <HStack $styles={{ gap: '$400', alignItems: 'start' }}>
            <VStack $styles={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    start
                </Text>
                <VStack
                    $styles={{
                        gap: '$100',
                        alignItems: 'start',
                        width: '$1600',
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
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        Medium Width
                    </Box>
                    <Box
                        $styles={{
                            backgroundColor: '$blue-300',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        Tiny
                    </Box>
                </VStack>
            </VStack>

            <VStack $styles={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    center
                </Text>
                <VStack
                    $styles={{
                        gap: '$100',
                        alignItems: 'center',
                        width: '$1600',
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
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        Medium Width
                    </Box>
                    <Box
                        $styles={{
                            backgroundColor: '$green-300',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        Tiny
                    </Box>
                </VStack>
            </VStack>

            <VStack $styles={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    end
                </Text>
                <VStack
                    $styles={{
                        gap: '$100',
                        alignItems: 'end',
                        width: '$1600',
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
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        Medium Width
                    </Box>
                    <Box
                        $styles={{
                            backgroundColor: '$purple-300',
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
