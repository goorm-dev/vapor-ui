import { Box, Flex, Text, VStack } from '@vapor-ui/core';

export default function FlexInline() {
    return (
        <VStack $styles={{ gap: '$200' }}>
            <VStack $styles={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    inline flex
                </Text>
                <Box>
                    <Text render={<span />}>Text before </Text>
                    <Flex
                        inline
                        $styles={{
                            gap: '$100',
                            padding: '$200',
                            backgroundColor: '$basic-blue-100',
                            borderRadius: '$200',
                        }}
                    >
                        <Box
                            $styles={{
                                padding: '$100',
                                backgroundColor: '$basic-blue-400',
                                borderRadius: '$050',
                                color: '$fg-contrast-100',
                            }}
                        >
                            Inline
                        </Box>
                        <Box
                            $styles={{
                                padding: '$100',
                                backgroundColor: '$basic-green-400',
                                borderRadius: '$050',
                                color: '$fg-contrast-100',
                            }}
                        >
                            Flex
                        </Box>
                    </Flex>
                    <Text render={<span />}> text after</Text>
                </Box>
            </VStack>

            <VStack $styles={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    block flex (default)
                </Text>
                <Flex
                    $styles={{
                        gap: '$200',
                        padding: '$300',
                        backgroundColor: '$basic-gray-100',
                        borderRadius: '$200',
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
                        Block
                    </Box>
                    <Box
                        $styles={{
                            padding: '$200',
                            backgroundColor: '$basic-green-400',
                            borderRadius: '$100',
                            color: '$fg-contrast-100',
                        }}
                    >
                        Flex
                    </Box>
                </Flex>
            </VStack>
        </VStack>
    );
}
