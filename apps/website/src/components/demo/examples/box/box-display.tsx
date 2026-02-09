import { Box, Text, VStack } from '@vapor-ui/core';

export default function BoxDisplay() {
    return (
        <VStack $styles={{ gap: '$300' }}>
            <VStack $styles={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    block
                </Text>
                <Box
                    $styles={{
                        display: 'block',
                        padding: '$300',
                        backgroundColor: '$basic-blue-200',
                        borderRadius: '$200',
                    }}
                >
                    Block element takes full width
                </Box>
            </VStack>

            <VStack $styles={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    inline
                </Text>
                <Box>
                    <Box
                        $styles={{
                            display: 'inline',
                            padding: '$200',
                            backgroundColor: '$basic-green-200',
                            borderRadius: '$200',
                        }}
                    >
                        Inline
                    </Box>
                    <Text render={<span />}> flows with text </Text>
                    <Box
                        $styles={{
                            display: 'inline',
                            padding: '$200',
                            backgroundColor: '$basic-green-200',
                            borderRadius: '$200',
                        }}
                    >
                        like this
                    </Box>
                </Box>
            </VStack>

            <VStack $styles={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    flex
                </Text>
                <Box
                    $styles={{
                        display: 'flex',
                        gap: '$200',
                        padding: '$300',
                        backgroundColor: '$basic-grape-200',
                        borderRadius: '$200',
                    }}
                >
                    <Box
                        $styles={{
                            padding: '$200',
                            backgroundColor: '$basic-grape-400',
                            borderRadius: '$100',
                            color: '$fg-contrast-100',
                        }}
                    >
                        Item 1
                    </Box>
                    <Box
                        $styles={{
                            padding: '$200',
                            backgroundColor: '$basic-grape-400',
                            borderRadius: '$100',
                            color: '$fg-contrast-100',
                        }}
                    >
                        Item 2
                    </Box>
                    <Box
                        $styles={{
                            padding: '$200',
                            backgroundColor: '$basic-grape-400',
                            borderRadius: '$100',
                            color: '$fg-contrast-100',
                        }}
                    >
                        Item 3
                    </Box>
                </Box>
            </VStack>

            <VStack $styles={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    grid
                </Text>
                <Box
                    $styles={{
                        display: 'grid',
                        padding: '$300',
                        backgroundColor: '$basic-orange-200',
                        borderRadius: '$200',
                        gap: '$200',
                    }}
                    style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
                >
                    <Box
                        $styles={{
                            padding: '$200',
                            backgroundColor: '$basic-orange-400',
                            borderRadius: '$100',
                            color: '$fg-contrast-100',
                        }}
                    >
                        A
                    </Box>
                    <Box
                        $styles={{
                            padding: '$200',
                            backgroundColor: '$basic-orange-400',
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
                </Box>
            </VStack>
        </VStack>
    );
}
