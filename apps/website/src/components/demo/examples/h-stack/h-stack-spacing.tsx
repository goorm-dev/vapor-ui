import { Box, HStack, Text, VStack } from '@vapor-ui/core';

export default function HStackSpacing() {
    return (
        <VStack $css={{ gap: '$200' }}>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    $100
                </Text>
                <HStack $css={{ gap: '$100' }}>
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
                </HStack>
            </HStack>

            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    $400
                </Text>
                <HStack $css={{ gap: '$400' }}>
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
                </HStack>
            </HStack>

            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    $800
                </Text>
                <HStack $css={{ gap: '$800' }}>
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
                </HStack>
            </HStack>
        </VStack>
    );
}
