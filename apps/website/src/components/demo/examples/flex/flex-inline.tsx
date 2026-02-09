import { Box, Flex, Text, VStack } from '@vapor-ui/core';

export default function FlexInline() {
    return (
        <VStack $css={{ gap: '$200' }}>
            <VStack $css={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    inline flex
                </Text>
                <Box>
                    <Text render={<span />}>Text before </Text>
                    <Flex
                        inline
                        $css={{
                            gap: '$100',
                            padding: '$200',
                            backgroundColor: '$basic-blue-100',
                            borderRadius: '$200',
                        }}
                    >
                        <Box
                            $css={{
                                padding: '$100',
                                backgroundColor: '$basic-blue-400',
                                borderRadius: '$050',
                                color: '$fg-contrast-100',
                            }}
                        >
                            Inline
                        </Box>
                        <Box
                            $css={{
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

            <VStack $css={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    block flex (default)
                </Text>
                <Flex
                    $css={{
                        gap: '$200',
                        padding: '$300',
                        backgroundColor: '$basic-gray-100',
                        borderRadius: '$200',
                    }}
                >
                    <Box
                        $css={{
                            padding: '$200',
                            backgroundColor: '$basic-blue-400',
                            borderRadius: '$100',
                            color: '$fg-contrast-100',
                        }}
                    >
                        Block
                    </Box>
                    <Box
                        $css={{
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
