import { Box, HStack, Text, VStack } from '@vapor-ui/core';

export default function HStackJustify() {
    return (
        <VStack $styles={{ gap: '$200' }}>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-24" typography="body3" foreground="hint-100">
                    flex-start
                </Text>
                <HStack
                    $styles={{
                        gap: '$100',
                        justifyContent: 'flex-start',
                        width: '$2400',
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
                </HStack>
            </HStack>

            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-24" typography="body3" foreground="hint-100">
                    center
                </Text>
                <HStack
                    $styles={{
                        gap: '$100',
                        justifyContent: 'center',
                        width: '$2400',
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
                </HStack>
            </HStack>

            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-24" typography="body3" foreground="hint-100">
                    space-between
                </Text>
                <HStack
                    $styles={{
                        gap: '$100',
                        justifyContent: 'space-between',
                        width: '$2400',
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
                </HStack>
            </HStack>
        </VStack>
    );
}
