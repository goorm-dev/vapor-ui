import { Box, Grid, HStack, Text, VStack } from '@vapor-ui/core';

export default function GridLayout() {
    return (
        <HStack $css={{ gap: '$400', alignItems: 'start' }}>
            <VStack $css={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    Dashboard Layout
                </Text>
                <Grid.Root
                    templateColumns="200px 1fr"
                    templateRows="60px 1fr 40px"
                    $css={{ gap: '$100', height: '$2400', width: '$4800' }}
                >
                    <Grid.Item colSpan="2">
                        <Box
                            $css={{
                                backgroundColor: '$basic-gray-200',
                                padding: '$200',
                                borderRadius: '$200',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                            }}
                        >
                            Header
                        </Box>
                    </Grid.Item>
                    <Grid.Item>
                        <Box
                            $css={{
                                backgroundColor: '$basic-blue-100',
                                padding: '$200',
                                borderRadius: '$200',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                            }}
                        >
                            Sidebar
                        </Box>
                    </Grid.Item>
                    <Grid.Item>
                        <Box
                            $css={{
                                backgroundColor: '$basic-green-100',
                                padding: '$200',
                                borderRadius: '$200',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                            }}
                        >
                            Main Content
                        </Box>
                    </Grid.Item>
                    <Grid.Item colSpan="2">
                        <Box
                            $css={{
                                backgroundColor: '$basic-gray-200',
                                padding: '$200',
                                borderRadius: '$200',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                            }}
                        >
                            Footer
                        </Box>
                    </Grid.Item>
                </Grid.Root>
            </VStack>

            <VStack $css={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    Card Layout
                </Text>
                <Grid.Root templateColumns="repeat(2, 1fr)" $css={{ gap: '$100', width: '$2400' }}>
                    <Grid.Item>
                        <Box
                            $css={{
                                backgroundColor: '$basic-yellow-100',
                                padding: '$400',
                                borderRadius: '$200',
                                textAlign: 'center',
                            }}
                        >
                            Card 1
                        </Box>
                    </Grid.Item>
                    <Grid.Item>
                        <Box
                            $css={{
                                backgroundColor: '$basic-yellow-100',
                                padding: '$400',
                                borderRadius: '$200',
                                textAlign: 'center',
                            }}
                        >
                            Card 2
                        </Box>
                    </Grid.Item>
                    <Grid.Item>
                        <Box
                            $css={{
                                backgroundColor: '$basic-yellow-100',
                                padding: '$400',
                                borderRadius: '$200',
                                textAlign: 'center',
                            }}
                        >
                            Card 3
                        </Box>
                    </Grid.Item>
                    <Grid.Item>
                        <Box
                            $css={{
                                backgroundColor: '$basic-yellow-100',
                                padding: '$400',
                                borderRadius: '$200',
                                textAlign: 'center',
                            }}
                        >
                            Card 4
                        </Box>
                    </Grid.Item>
                </Grid.Root>
            </VStack>
        </HStack>
    );
}
