import { Box, HStack, Text, VStack } from '@vapor-ui/core';

export default function BoxVisual() {
    return (
        <VStack $styles={{ gap: '$300' }}>
            <VStack $styles={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    borderRadius
                </Text>
                <HStack $styles={{ gap: '$200', alignItems: 'center' }}>
                    <Box
                        $styles={{
                            padding: '$400',
                            backgroundColor: '$basic-blue-200',
                            borderRadius: '$100',
                        }}
                    >
                        Small
                    </Box>
                    <Box
                        $styles={{
                            padding: '$400',
                            backgroundColor: '$basic-blue-300',
                            borderRadius: '$300',
                        }}
                    >
                        Medium
                    </Box>
                    <Box
                        $styles={{
                            padding: '$400',
                            backgroundColor: '$basic-blue-400',
                            borderRadius: '$600',
                        }}
                    >
                        Large
                    </Box>
                    <Box
                        $styles={{
                            padding: '$400',
                            backgroundColor: '$basic-blue-500',
                            borderRadius: '$900',
                            color: '$fg-contrast-100',
                        }}
                    >
                        Extra Large
                    </Box>
                </HStack>
            </VStack>

            <VStack $styles={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    opacity
                </Text>
                <HStack $styles={{ gap: '$200', alignItems: 'center' }}>
                    <Box
                        $styles={{
                            padding: '$400',
                            backgroundColor: '$basic-green-500',
                            opacity: '0.3',
                            borderRadius: '$200',
                        }}
                    >
                        30%
                    </Box>
                    <Box
                        $styles={{
                            padding: '$400',
                            backgroundColor: '$basic-green-500',
                            opacity: '0.6',
                            borderRadius: '$200',
                        }}
                    >
                        60%
                    </Box>
                    <Box
                        $styles={{
                            padding: '$400',
                            backgroundColor: '$basic-green-500',
                            opacity: '0.9',
                            borderRadius: '$200',
                        }}
                    >
                        90%
                    </Box>
                    <Box
                        $styles={{
                            padding: '$400',
                            backgroundColor: '$basic-green-500',
                            borderRadius: '$200',
                        }}
                    >
                        100%
                    </Box>
                </HStack>
            </VStack>

            <VStack $styles={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    textAlign
                </Text>
                <VStack $styles={{ gap: '$100' }}>
                    <Box
                        $styles={{
                            padding: '$400',
                            backgroundColor: '$basic-grape-100',
                            borderRadius: '$200',
                            textAlign: 'left',
                        }}
                    >
                        Left aligned
                    </Box>
                    <Box
                        $styles={{
                            padding: '$400',
                            backgroundColor: '$basic-grape-200',
                            borderRadius: '$200',
                            textAlign: 'center',
                        }}
                    >
                        Center aligned
                    </Box>
                    <Box
                        $styles={{
                            padding: '$400',
                            backgroundColor: '$basic-grape-300',
                            borderRadius: '$200',
                            textAlign: 'right',
                        }}
                    >
                        Right aligned
                    </Box>
                </VStack>
            </VStack>

            <VStack $styles={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    overflow
                </Text>
                <VStack $styles={{ gap: '$200' }}>
                    <Box
                        $styles={{
                            height: '$800',
                            padding: '$300',
                            backgroundColor: '$basic-orange-200',
                            borderRadius: '$200',
                            overflow: 'hidden',
                        }}
                    >
                        This text will be clipped when it overflows the container bounds because
                        overflow is set to hidden.
                    </Box>
                    <Box
                        $styles={{
                            height: '$300',
                            padding: '$300',
                            backgroundColor: '$basic-orange-300',
                            borderRadius: '$200',
                            overflow: 'scroll',
                        }}
                    >
                        This text will show scrollbars when it overflows the container bounds
                        because overflow is set to scroll.
                    </Box>
                </VStack>
            </VStack>
        </VStack>
    );
}
