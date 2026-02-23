import { Box, HStack, Text, VStack } from '@vapor-ui/core';

export default function VStackReverse() {
    return (
        <HStack $css={{ gap: '$400', alignItems: 'start' }}>
            <VStack $css={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    normal
                </Text>
                <VStack $css={{ gap: '$150' }}>
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
                </VStack>
            </VStack>

            <VStack $css={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    reverse
                </Text>
                <VStack reverse $css={{ gap: '$150' }}>
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
                </VStack>
            </VStack>
        </HStack>
    );
}
