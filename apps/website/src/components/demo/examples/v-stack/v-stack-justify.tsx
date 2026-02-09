import { Box, HStack, Text, VStack } from '@vapor-ui/core';

export default function VStackJustify() {
    return (
        <HStack $styles={{ gap: '$400', alignItems: 'start' }}>
            <VStack $styles={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    flex-start
                </Text>
                <VStack
                    $styles={{
                        gap: '$100',
                        justifyContent: 'flex-start',
                        height: '$1600',
                        backgroundColor: '$gray-100',
                        padding: '$200',
                        borderRadius: '$200',
                    }}
                >
                    <Box
                        $styles={{
                            backgroundColor: '$red-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        A
                    </Box>
                    <Box
                        $styles={{
                            backgroundColor: '$red-200',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        B
                    </Box>
                    <Box
                        $styles={{
                            backgroundColor: '$red-300',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        C
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
                        justifyContent: 'center',
                        height: '$1600',
                        backgroundColor: '$gray-100',
                        padding: '$200',
                        borderRadius: '$200',
                    }}
                >
                    <Box
                        $styles={{
                            backgroundColor: '$yellow-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        A
                    </Box>
                    <Box
                        $styles={{
                            backgroundColor: '$yellow-200',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        B
                    </Box>
                    <Box
                        $styles={{
                            backgroundColor: '$yellow-300',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        C
                    </Box>
                </VStack>
            </VStack>

            <VStack $styles={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    space-between
                </Text>
                <VStack
                    $styles={{
                        gap: '$100',
                        justifyContent: 'space-between',
                        height: '$1600',
                        backgroundColor: '$gray-100',
                        padding: '$200',
                        borderRadius: '$200',
                    }}
                >
                    <Box
                        $styles={{
                            backgroundColor: '$indigo-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        A
                    </Box>
                    <Box
                        $styles={{
                            backgroundColor: '$indigo-200',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        B
                    </Box>
                    <Box
                        $styles={{
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
