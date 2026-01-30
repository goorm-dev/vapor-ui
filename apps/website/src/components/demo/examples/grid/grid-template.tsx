import { Box, Grid, HStack, Text, VStack } from '@vapor-ui/core';

export default function GridTemplate() {
    return (
        <HStack gap="$400" alignItems="start">
            <VStack gap="$150">
                <Text typography="body3" foreground="hint-100">
                    templateColumns
                </Text>
                <Grid.Root templateColumns="200px 1fr 100px" gap="$100">
                    <Grid.Item>
                        <Box
                            backgroundColor="$blue-100"
                            padding="$200"
                            borderRadius="$200"
                            textAlign="center"
                        >
                            200px
                        </Box>
                    </Grid.Item>
                    <Grid.Item>
                        <Box
                            backgroundColor="$blue-100"
                            padding="$200"
                            borderRadius="$200"
                            textAlign="center"
                        >
                            1fr
                        </Box>
                    </Grid.Item>
                    <Grid.Item>
                        <Box
                            backgroundColor="$blue-100"
                            padding="$200"
                            borderRadius="$200"
                            textAlign="center"
                        >
                            100px
                        </Box>
                    </Grid.Item>
                </Grid.Root>
            </VStack>

            <VStack gap="$150">
                <Text typography="body3" foreground="hint-100">
                    templateRows
                </Text>
                <Grid.Root
                    templateColumns="1fr"
                    templateRows="60px 1fr 40px"
                    gap="$100"
                    height="$1600"
                >
                    <Grid.Item>
                        <Box
                            backgroundColor="$green-100"
                            padding="$200"
                            borderRadius="$200"
                            textAlign="center"
                            height="100%"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            60px
                        </Box>
                    </Grid.Item>
                    <Grid.Item>
                        <Box
                            backgroundColor="$green-100"
                            padding="$200"
                            borderRadius="$200"
                            textAlign="center"
                            height="100%"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            1fr
                        </Box>
                    </Grid.Item>
                    <Grid.Item>
                        <Box
                            backgroundColor="$green-100"
                            padding="$200"
                            borderRadius="$200"
                            textAlign="center"
                            height="100%"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            40px
                        </Box>
                    </Grid.Item>
                </Grid.Root>
            </VStack>
        </HStack>
    );
}
