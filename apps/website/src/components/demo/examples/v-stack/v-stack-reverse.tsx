import { Box, HStack, Text, VStack } from '@vapor-ui/core';

export default function VStackReverse() {
    return (
        <HStack $styles={{ gap: '$400', alignItems: 'start' }}>
            <VStack $styles={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    normal
                </Text>
                <VStack $styles={{ gap: '$150' }}>
                    <Box
                        $styles={{
                            backgroundColor: '$basic-green-100',
                            padding: '$300',
                            borderRadius: '$200',
                        }}
                    >
                        First
                    </Box>
                    <Box
                        $styles={{
                            backgroundColor: '$basic-green-200',
                            padding: '$300',
                            borderRadius: '$200',
                        }}
                    >
                        Second
                    </Box>
                    <Box
                        $styles={{
                            backgroundColor: '$basic-green-300',
                            padding: '$300',
                            borderRadius: '$200',
                        }}
                    >
                        Third
                    </Box>
                </VStack>
            </VStack>

            <VStack $styles={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    reverse
                </Text>
                <VStack reverse $styles={{ gap: '$150' }}>
                    <Box
                        $styles={{
                            backgroundColor: '$basic-purple-100',
                            padding: '$300',
                            borderRadius: '$200',
                        }}
                    >
                        First
                    </Box>
                    <Box
                        $styles={{
                            backgroundColor: '$basic-purple-200',
                            padding: '$300',
                            borderRadius: '$200',
                        }}
                    >
                        Second
                    </Box>
                    <Box
                        $styles={{
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
