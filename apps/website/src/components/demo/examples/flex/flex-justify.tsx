import { Box, Flex, HStack, Text, VStack } from '@vapor-ui/core';

export default function FlexJustify() {
    return (
        <VStack $styles={{ gap: '$200' }}>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-24" typography="body3" foreground="hint-100">
                    flex-start
                </Text>
                <Flex
                    $styles={{
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
                            backgroundColor: '$basic-blue-400',
                            borderRadius: '$100',
                            color: '$fg-contrast-100',
                        }}
                    >
                        A
                    </Box>
                    <Box
                        $styles={{
                            padding: '$200',
                            backgroundColor: '$basic-green-400',
                            borderRadius: '$100',
                            color: '$fg-contrast-100',
                        }}
                    >
                        B
                    </Box>
                </Flex>
            </HStack>

            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-24" typography="body3" foreground="hint-100">
                    center
                </Text>
                <Flex
                    $styles={{
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
                            backgroundColor: '$basic-blue-400',
                            borderRadius: '$100',
                            color: '$fg-contrast-100',
                        }}
                    >
                        A
                    </Box>
                    <Box
                        $styles={{
                            padding: '$200',
                            backgroundColor: '$basic-green-400',
                            borderRadius: '$100',
                            color: '$fg-contrast-100',
                        }}
                    >
                        B
                    </Box>
                </Flex>
            </HStack>

            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-24" typography="body3" foreground="hint-100">
                    flex-end
                </Text>
                <Flex
                    $styles={{
                        justifyContent: 'flex-end',
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
                            backgroundColor: '$basic-blue-400',
                            borderRadius: '$100',
                            color: '$fg-contrast-100',
                        }}
                    >
                        A
                    </Box>
                    <Box
                        $styles={{
                            padding: '$200',
                            backgroundColor: '$basic-green-400',
                            borderRadius: '$100',
                            color: '$fg-contrast-100',
                        }}
                    >
                        B
                    </Box>
                </Flex>
            </HStack>

            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-24" typography="body3" foreground="hint-100">
                    space-between
                </Text>
                <Flex
                    $styles={{
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
                            backgroundColor: '$basic-blue-400',
                            borderRadius: '$100',
                            color: '$fg-contrast-100',
                        }}
                    >
                        A
                    </Box>
                    <Box
                        $styles={{
                            padding: '$200',
                            backgroundColor: '$basic-green-400',
                            borderRadius: '$100',
                            color: '$fg-contrast-100',
                        }}
                    >
                        B
                    </Box>
                    <Box
                        $styles={{
                            padding: '$200',
                            backgroundColor: '$basic-orange-400',
                            borderRadius: '$100',
                            color: '$fg-contrast-100',
                        }}
                    >
                        C
                    </Box>
                </Flex>
            </HStack>
        </VStack>
    );
}
