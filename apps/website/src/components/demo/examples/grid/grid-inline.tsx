import { Box, Grid, HStack, Text, VStack } from '@vapor-ui/core';

export default function GridInline() {
    return (
        <HStack $styles={{ gap: '$400', alignItems: 'start' }}>
            <VStack $styles={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    block (default)
                </Text>
                <Grid.Root templateColumns="repeat(2, 1fr)" $styles={{ gap: '$100' }}>
                    <Grid.Item>
                        <Box
                            $styles={{
                                backgroundColor: '$basic-violet-100',
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
                                backgroundColor: '$basic-violet-100',
                                padding: '$200',
                                borderRadius: '$200',
                                textAlign: 'center',
                            }}
                        >
                            2
                        </Box>
                    </Grid.Item>
                </Grid.Root>
            </VStack>

            <VStack $styles={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    inline
                </Text>
                <Box>
                    <Grid.Root inline templateColumns="repeat(2, 1fr)" $styles={{ gap: '$100' }}>
                        <Grid.Item>
                            <Box
                                $styles={{
                                    backgroundColor: '$basic-pink-100',
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
                                    backgroundColor: '$basic-pink-100',
                                    padding: '$200',
                                    borderRadius: '$200',
                                    textAlign: 'center',
                                }}
                            >
                                2
                            </Box>
                        </Grid.Item>
                    </Grid.Root>
                    <Text render={<span />}> inline grid</Text>
                </Box>
            </VStack>
        </HStack>
    );
}
