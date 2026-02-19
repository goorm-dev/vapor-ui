import { Box, HStack, Text, VStack } from '@vapor-ui/core';

export default function HStackReverse() {
    return (
        <VStack $css={{ gap: '$200' }}>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    normal
                </Text>
                <HStack $css={{ gap: '$150' }}>
                    <Box
                        $css={{
                            backgroundColor: '$basic-green-100',
                            padding: '$300',
                            borderRadius: '$200',
                        }}
                    >
                        First
                    </Box>
                    <Box
                        $css={{
                            backgroundColor: '$basic-green-200',
                            padding: '$300',
                            borderRadius: '$200',
                        }}
                    >
                        Second
                    </Box>
                    <Box
                        $css={{
                            backgroundColor: '$basic-green-300',
                            padding: '$300',
                            borderRadius: '$200',
                        }}
                    >
                        Third
                    </Box>
                </HStack>
            </HStack>

            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    reverse
                </Text>
                <HStack reverse $css={{ gap: '$150' }}>
                    <Box
                        $css={{
                            backgroundColor: '$basic-purple-100',
                            padding: '$300',
                            borderRadius: '$200',
                        }}
                    >
                        First
                    </Box>
                    <Box
                        $css={{
                            backgroundColor: '$basic-purple-200',
                            padding: '$300',
                            borderRadius: '$200',
                        }}
                    >
                        Second
                    </Box>
                    <Box
                        $css={{
                            backgroundColor: '$basic-purple-300',
                            padding: '$300',
                            borderRadius: '$200',
                        }}
                    >
                        Third
                    </Box>
                </HStack>
            </HStack>
        </VStack>
    );
}
