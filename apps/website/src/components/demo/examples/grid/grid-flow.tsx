import { Box, Grid, HStack, Text, VStack } from '@vapor-ui/core';

export default function GridFlow() {
    return (
        <HStack $styles={{ gap: '$400', alignItems: 'start' }}>
            <VStack $styles={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    row
                </Text>
                <Grid.Root templateColumns="repeat(3, 1fr)" flow="row" $styles={{ gap: '$100' }}>
                    <Grid.Item>
                        <Box
                            $styles={{
                                backgroundColor: '$basic-grape-100',
                                padding: '$200',
                                borderRadius: '$200',
                                textAlign: 'center',
                            }}
                        >
                            1
                        </Box>
                    </Grid.Item>
                    <Grid.Item>
                        <Box
                            $styles={{
                                backgroundColor: '$basic-grape-100',
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
                            $styles={{
                                backgroundColor: '$basic-grape-100',
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
                            $styles={{
                                backgroundColor: '$basic-grape-100',
                                padding: '$200',
                                borderRadius: '$200',
                                textAlign: 'center',
                            }}
                        >
                            4
                        </Box>
                    </Grid.Item>
                    <Grid.Item>
                        <Box
                            $styles={{
                                backgroundColor: '$basic-grape-100',
                                padding: '$200',
                                borderRadius: '$200',
                                textAlign: 'center',
                            }}
                        >
                            5
                        </Box>
                    </Grid.Item>
                </Grid.Root>
            </VStack>

            <VStack $styles={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    column
                </Text>
                <Grid.Root
                    templateRows="repeat(3, 1fr)"
                    flow="column"
                    $styles={{ gap: '$100', height: '$1600' }}
                >
                    <Grid.Item>
                        <Box
                            $styles={{
                                backgroundColor: '$basic-orange-100',
                                padding: '$200',
                                borderRadius: '$200',
                                textAlign: 'center',
                            }}
                        >
                            1
                        </Box>
                    </Grid.Item>
                    <Grid.Item>
                        <Box
                            $styles={{
                                backgroundColor: '$basic-orange-100',
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
                            $styles={{
                                backgroundColor: '$basic-orange-100',
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
                            $styles={{
                                backgroundColor: '$basic-orange-100',
                                padding: '$200',
                                borderRadius: '$200',
                                textAlign: 'center',
                            }}
                        >
                            4
                        </Box>
                    </Grid.Item>
                    <Grid.Item>
                        <Box
                            $styles={{
                                backgroundColor: '$basic-orange-100',
                                padding: '$200',
                                borderRadius: '$200',
                                textAlign: 'center',
                            }}
                        >
                            5
                        </Box>
                    </Grid.Item>
                </Grid.Root>
            </VStack>
        </HStack>
    );
}
