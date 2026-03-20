import { Box, HStack, Text, VStack } from '@vapor-ui/core';

export default function VStackSpacing() {
    return (
        <HStack $css={{ gap: '$400', alignItems: 'start' }}>
            <VStack $css={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    $100
                </Text>
                <VStack $css={{ gap: '$100' }}>
                    <Box
                        $css={{
                            backgroundColor: '$basic-red-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        A
                    </Box>
                    <Box
                        $css={{
                            backgroundColor: '$basic-red-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        B
                    </Box>
                    <Box
                        $css={{
                            backgroundColor: '$basic-red-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        C
                    </Box>
                </VStack>
            </VStack>

            <VStack $css={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    $400
                </Text>
                <VStack $css={{ gap: '$400' }}>
                    <Box
                        $css={{
                            backgroundColor: '$basic-orange-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        A
                    </Box>
                    <Box
                        $css={{
                            backgroundColor: '$basic-orange-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        B
                    </Box>
                    <Box
                        $css={{
                            backgroundColor: '$basic-orange-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        C
                    </Box>
                </VStack>
            </VStack>

            <VStack $css={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    $800
                </Text>
                <VStack $css={{ gap: '$800' }}>
                    <Box
                        $css={{
                            backgroundColor: '$basic-teal-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        A
                    </Box>
                    <Box
                        $css={{
                            backgroundColor: '$basic-teal-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        B
                    </Box>
                    <Box
                        $css={{
                            backgroundColor: '$basic-teal-100',
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
