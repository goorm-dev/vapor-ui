import { Box, HStack, Text, VStack } from '@vapor-ui/core';

export default function BoxLayout() {
    return (
        <VStack $css={{ gap: '$300' }}>
            <VStack $css={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    flexDirection
                </Text>
                <VStack $css={{ gap: '$200' }}>
                    <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                        <Text className="w-24" typography="body3" foreground="hint-100">
                            row
                        </Text>
                        <Box
                            $css={{
                                display: 'flex',
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
                                    backgroundColor: '$basic-blue-300',
                                    borderRadius: '$100',
                                }}
                            >
                                1
                            </Box>
                            <Box
                                $css={{
                                    padding: '$200',
                                    backgroundColor: '$basic-blue-300',
                                    borderRadius: '$100',
                                }}
                            >
                                2
                            </Box>
                            <Box
                                $css={{
                                    padding: '$200',
                                    backgroundColor: '$basic-blue-300',
                                    borderRadius: '$100',
                                }}
                            >
                                3
                            </Box>
                        </Box>
                    </HStack>
                    <HStack $css={{ gap: '$150', alignItems: 'start' }}>
                        <Text className="w-24" typography="body3" foreground="hint-100">
                            column
                        </Text>
                        <Box
                            $css={{
                                display: 'flex',
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
                                    backgroundColor: '$basic-green-300',
                                    borderRadius: '$100',
                                }}
                            >
                                A
                            </Box>
                            <Box
                                $css={{
                                    padding: '$200',
                                    backgroundColor: '$basic-green-300',
                                    borderRadius: '$100',
                                }}
                            >
                                B
                            </Box>
                            <Box
                                $css={{
                                    padding: '$200',
                                    backgroundColor: '$basic-green-300',
                                    borderRadius: '$100',
                                }}
                            >
                                C
                            </Box>
                        </Box>
                    </HStack>
                </VStack>
            </VStack>

            <VStack $css={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    justifyContent
                </Text>
                <VStack $css={{ gap: '$200' }}>
                    <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                        <Text className="w-24" typography="body3" foreground="hint-100">
                            flex-start
                        </Text>
                        <Box
                            $css={{
                                display: 'flex',
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
                                    backgroundColor: '$basic-grape-300',
                                    borderRadius: '$100',
                                }}
                            >
                                Start
                            </Box>
                            <Box
                                $css={{
                                    padding: '$200',
                                    backgroundColor: '$basic-grape-300',
                                    borderRadius: '$100',
                                }}
                            >
                                Items
                            </Box>
                        </Box>
                    </HStack>
                    <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                        <Text className="w-24" typography="body3" foreground="hint-100">
                            center
                        </Text>
                        <Box
                            $css={{
                                display: 'flex',
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
                                    backgroundColor: '$basic-grape-300',
                                    borderRadius: '$100',
                                }}
                            >
                                Center
                            </Box>
                            <Box
                                $css={{
                                    padding: '$200',
                                    backgroundColor: '$basic-grape-300',
                                    borderRadius: '$100',
                                }}
                            >
                                Items
                            </Box>
                        </Box>
                    </HStack>
                    <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                        <Text className="w-24" typography="body3" foreground="hint-100">
                            space-between
                        </Text>
                        <Box
                            $css={{
                                display: 'flex',
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
                                    backgroundColor: '$basic-grape-300',
                                    borderRadius: '$100',
                                }}
                            >
                                Space
                            </Box>
                            <Box
                                $css={{
                                    padding: '$200',
                                    backgroundColor: '$basic-grape-300',
                                    borderRadius: '$100',
                                }}
                            >
                                Between
                            </Box>
                        </Box>
                    </HStack>
                </VStack>
            </VStack>

            <VStack $css={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    alignItems
                </Text>
                <Box
                    $css={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-around',
                        gap: '$200',
                        padding: '$300',
                        backgroundColor: '$basic-gray-100',
                        borderRadius: '$200',
                        height: '$800',
                    }}
                >
                    <Box
                        $css={{
                            padding: '$200',
                            backgroundColor: '$basic-orange-300',
                            borderRadius: '$100',
                            height: '$500',
                        }}
                    >
                        Small
                    </Box>
                    <Box
                        $css={{
                            padding: '$200',
                            backgroundColor: '$basic-orange-300',
                            borderRadius: '$100',
                            height: '$600',
                        }}
                    >
                        Medium
                    </Box>
                    <Box
                        $css={{
                            padding: '$200',
                            backgroundColor: '$basic-orange-300',
                            borderRadius: '$100',
                            height: '$700',
                        }}
                    >
                        Aligned
                    </Box>
                </Box>
            </VStack>
        </VStack>
    );
}
