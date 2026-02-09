import { Box, Grid, HStack, Text, VStack } from '@vapor-ui/core';

export default function GridSpan() {
    return (
        <HStack $css={{ gap: '$400', alignItems: 'start' }}>
            <VStack $css={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    colSpan
                </Text>
                <Grid.Root templateColumns="repeat(4, 1fr)" $css={{ gap: '$100' }}>
                    <Grid.Item>
                        <Box
                            $css={{
                                backgroundColor: '$basic-red-100',
                                padding: '$200',
                                borderRadius: '$200',
                                textAlign: 'center',
                            }}
                        >
                            1
                        </Box>
                    </Grid.Item>
                    <Grid.Item colSpan="2">
                        <Box
                            $css={{
                                backgroundColor: '$basic-red-200',
                                padding: '$200',
                                borderRadius: '$200',
                                textAlign: 'center',
                            }}
                        >
                            Span 2
                        </Box>
                    </Grid.Item>
                    <Grid.Item>
                        <Box
                            $css={{
                                backgroundColor: '$basic-red-100',
                                padding: '$200',
                                borderRadius: '$200',
                                textAlign: 'center',
                            }}
                        >
                            4
                        </Box>
                    </Grid.Item>
                    <Grid.Item colSpan="3">
                        <Box
                            $css={{
                                backgroundColor: '$basic-red-200',
                                padding: '$200',
                                borderRadius: '$200',
                                textAlign: 'center',
                            }}
                        >
                            Span 3
                        </Box>
                    </Grid.Item>
                    <Grid.Item>
                        <Box
                            $css={{
                                backgroundColor: '$basic-red-100',
                                padding: '$200',
                                borderRadius: '$200',
                                textAlign: 'center',
                            }}
                        >
                            8
                        </Box>
                    </Grid.Item>
                </Grid.Root>
            </VStack>

            <VStack $css={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    rowSpan
                </Text>
                <Grid.Root templateColumns="repeat(3, 1fr)" $css={{ gap: '$100' }}>
                    <Grid.Item rowSpan="2">
                        <Box
                            $css={{
                                backgroundColor: '$basic-cyan-200',
                                padding: '$200',
                                borderRadius: '$200',
                                textAlign: 'center',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            Row Span 2
                        </Box>
                    </Grid.Item>
                    <Grid.Item>
                        <Box
                            $css={{
                                backgroundColor: '$basic-cyan-100',
                                padding: '$200',
                                borderRadius: '$200',
                                textAlign: 'center',
                            }}
                        >
                            2
                        </Box>
                    </Grid.Item>
                    <Grid.Item>
                        <Box
                            $css={{
                                backgroundColor: '$basic-cyan-100',
                                padding: '$200',
                                borderRadius: '$200',
                                textAlign: 'center',
                            }}
                        >
                            3
                        </Box>
                    </Grid.Item>
                    <Grid.Item>
                        <Box
                            $css={{
                                backgroundColor: '$basic-cyan-100',
                                padding: '$200',
                                borderRadius: '$200',
                                textAlign: 'center',
                            }}
                        >
                            5
                        </Box>
                    </Grid.Item>
                    <Grid.Item>
                        <Box
                            $css={{
                                backgroundColor: '$basic-cyan-100',
                                padding: '$200',
                                borderRadius: '$200',
                                textAlign: 'center',
                            }}
                        >
                            6
                        </Box>
                    </Grid.Item>
                </Grid.Root>
            </VStack>
        </HStack>
    );
}
