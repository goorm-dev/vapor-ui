import { Box, HStack, Text, VStack } from '@vapor-ui/core';

export default function BoxLayout() {
    return (
        <VStack $styles={{ gap: '$300' }}>
            <VStack $styles={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    flexDirection
                </Text>
                <VStack $styles={{ gap: '$200' }}>
                    <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                        <Text className="w-24" typography="body3" foreground="hint-100">
                            row
                        </Text>
                        <Box
                            $styles={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '$200',
                                padding: '$300',
                                backgroundColor: '$basic-gray-100',
                                borderRadius: '$200',
                            }}
                        >
                            <Box
                                $styles={{
                                    padding: '$200',
                                    backgroundColor: '$basic-blue-300',
                                    borderRadius: '$100',
                                }}
                            >
                                1
                            </Box>
                            <Box
                                $styles={{
                                    padding: '$200',
                                    backgroundColor: '$basic-blue-300',
                                    borderRadius: '$100',
                                }}
                            >
                                2
                            </Box>
                            <Box
                                $styles={{
                                    padding: '$200',
                                    backgroundColor: '$basic-blue-300',
                                    borderRadius: '$100',
                                }}
                            >
                                3
                            </Box>
                        </Box>
                    </HStack>
                    <HStack $styles={{ gap: '$150', alignItems: 'start' }}>
                        <Text className="w-24" typography="body3" foreground="hint-100">
                            column
                        </Text>
                        <Box
                            $styles={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '$200',
                                padding: '$300',
                                backgroundColor: '$basic-gray-100',
                                borderRadius: '$200',
                            }}
                        >
                            <Box
                                $styles={{
                                    padding: '$200',
                                    backgroundColor: '$basic-green-300',
                                    borderRadius: '$100',
                                }}
                            >
                                A
                            </Box>
                            <Box
                                $styles={{
                                    padding: '$200',
                                    backgroundColor: '$basic-green-300',
                                    borderRadius: '$100',
                                }}
                            >
                                B
                            </Box>
                            <Box
                                $styles={{
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

            <VStack $styles={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    justifyContent
                </Text>
                <VStack $styles={{ gap: '$200' }}>
                    <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                        <Text className="w-24" typography="body3" foreground="hint-100">
                            flex-start
                        </Text>
                        <Box
                            $styles={{
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
                                $styles={{
                                    padding: '$200',
                                    backgroundColor: '$basic-grape-300',
                                    borderRadius: '$100',
                                }}
                            >
                                Start
                            </Box>
                            <Box
                                $styles={{
                                    padding: '$200',
                                    backgroundColor: '$basic-grape-300',
                                    borderRadius: '$100',
                                }}
                            >
                                Items
                            </Box>
                        </Box>
                    </HStack>
                    <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                        <Text className="w-24" typography="body3" foreground="hint-100">
                            center
                        </Text>
                        <Box
                            $styles={{
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
                                $styles={{
                                    padding: '$200',
                                    backgroundColor: '$basic-grape-300',
                                    borderRadius: '$100',
                                }}
                            >
                                Center
                            </Box>
                            <Box
                                $styles={{
                                    padding: '$200',
                                    backgroundColor: '$basic-grape-300',
                                    borderRadius: '$100',
                                }}
                            >
                                Items
                            </Box>
                        </Box>
                    </HStack>
                    <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                        <Text className="w-24" typography="body3" foreground="hint-100">
                            space-between
                        </Text>
                        <Box
                            $styles={{
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
                                $styles={{
                                    padding: '$200',
                                    backgroundColor: '$basic-grape-300',
                                    borderRadius: '$100',
                                }}
                            >
                                Space
                            </Box>
                            <Box
                                $styles={{
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

            <VStack $styles={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    alignItems
                </Text>
                <Box
                    $styles={{
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
                        $styles={{
                            padding: '$200',
                            backgroundColor: '$basic-orange-300',
                            borderRadius: '$100',
                            height: '$500',
                        }}
                    >
                        Small
                    </Box>
                    <Box
                        $styles={{
                            padding: '$200',
                            backgroundColor: '$basic-orange-300',
                            borderRadius: '$100',
                            height: '$600',
                        }}
                    >
                        Medium
                    </Box>
                    <Box
                        $styles={{
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
