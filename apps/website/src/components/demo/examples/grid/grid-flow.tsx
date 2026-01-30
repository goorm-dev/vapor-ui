import { Box, Grid, HStack, Text, VStack } from '@vapor-ui/core';

export default function GridFlow() {
    return (
        <HStack gap="$400" alignItems="start">
            <VStack gap="$150">
                <Text typography="body3" foreground="hint-100">
                    row
                </Text>
                <Grid.Root templateColumns="repeat(3, 1fr)" flow="row" gap="$100">
                    <Grid.Item>
                        <Box
                            backgroundColor="$purple-100"
                            padding="$200"
                            borderRadius="$200"
                            textAlign="center"
                        >
                            1
                        </Box>
                    </Grid.Item>
                    <Grid.Item>
                        <Box
                            backgroundColor="$purple-100"
                            padding="$200"
                            borderRadius="$200"
                            textAlign="center"
                        >
                            2
                        </Box>
                    </Grid.Item>
                    <Grid.Item>
                        <Box
                            backgroundColor="$purple-100"
                            padding="$200"
                            borderRadius="$200"
                            textAlign="center"
                        >
                            3
                        </Box>
                    </Grid.Item>
                    <Grid.Item>
                        <Box
                            backgroundColor="$purple-100"
                            padding="$200"
                            borderRadius="$200"
                            textAlign="center"
                        >
                            4
                        </Box>
                    </Grid.Item>
                    <Grid.Item>
                        <Box
                            backgroundColor="$purple-100"
                            padding="$200"
                            borderRadius="$200"
                            textAlign="center"
                        >
                            5
                        </Box>
                    </Grid.Item>
                </Grid.Root>
            </VStack>

            <VStack gap="$150">
                <Text typography="body3" foreground="hint-100">
                    column
                </Text>
                <Grid.Root templateRows="repeat(3, 1fr)" flow="column" gap="$100" height="$1600">
                    <Grid.Item>
                        <Box
                            backgroundColor="$orange-100"
                            padding="$200"
                            borderRadius="$200"
                            textAlign="center"
                        >
                            1
                        </Box>
                    </Grid.Item>
                    <Grid.Item>
                        <Box
                            backgroundColor="$orange-100"
                            padding="$200"
                            borderRadius="$200"
                            textAlign="center"
                        >
                            2
                        </Box>
                    </Grid.Item>
                    <Grid.Item>
                        <Box
                            backgroundColor="$orange-100"
                            padding="$200"
                            borderRadius="$200"
                            textAlign="center"
                        >
                            3
                        </Box>
                    </Grid.Item>
                    <Grid.Item>
                        <Box
                            backgroundColor="$orange-100"
                            padding="$200"
                            borderRadius="$200"
                            textAlign="center"
                        >
                            4
                        </Box>
                    </Grid.Item>
                    <Grid.Item>
                        <Box
                            backgroundColor="$orange-100"
                            padding="$200"
                            borderRadius="$200"
                            textAlign="center"
                        >
                            5
                        </Box>
                    </Grid.Item>
                </Grid.Root>
            </VStack>
        </HStack>
    );
}
