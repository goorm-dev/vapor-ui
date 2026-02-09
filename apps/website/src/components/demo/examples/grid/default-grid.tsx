import { Box, Grid } from '@vapor-ui/core';

export default function DefaultGrid() {
    return (
        <Grid.Root templateColumns="repeat(3, 1fr)" $styles={{ gap: '$200' }}>
            <Grid.Item>
                <Box
                    $styles={{
                        backgroundColor: '$basic-gray-100',
                        padding: '$400',
                        borderRadius: '$200',
                    }}
                >
                    1
                </Box>
            </Grid.Item>
            <Grid.Item>
                <Box
                    $styles={{
                        backgroundColor: '$basic-gray-100',
                        padding: '$400',
                        borderRadius: '$200',
                    }}
                >
                    2
                </Box>
            </Grid.Item>
            <Grid.Item>
                <Box
                    $styles={{
                        backgroundColor: '$basic-gray-100',
                        padding: '$400',
                        borderRadius: '$200',
                    }}
                >
                    3
                </Box>
            </Grid.Item>
            <Grid.Item>
                <Box
                    $styles={{
                        backgroundColor: '$basic-gray-100',
                        padding: '$400',
                        borderRadius: '$200',
                    }}
                >
                    4
                </Box>
            </Grid.Item>
            <Grid.Item>
                <Box
                    $styles={{
                        backgroundColor: '$basic-gray-100',
                        padding: '$400',
                        borderRadius: '$200',
                    }}
                >
                    5
                </Box>
            </Grid.Item>
            <Grid.Item>
                <Box
                    $styles={{
                        backgroundColor: '$basic-gray-100',
                        padding: '$400',
                        borderRadius: '$200',
                    }}
                >
                    6
                </Box>
            </Grid.Item>
        </Grid.Root>
    );
}
