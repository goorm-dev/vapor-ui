import { Box, HStack, Text, VStack } from '@vapor-ui/core';

export default function HStackReverse() {
    return (
        <VStack $styles={{ gap: '$200' }}>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    normal
                </Text>
                <HStack $styles={{ gap: '$150' }}>
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
                </HStack>
            </HStack>

            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    reverse
                </Text>
                <HStack reverse $styles={{ gap: '$150' }}>
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
                </HStack>
            </HStack>
        </VStack>
    );
}
