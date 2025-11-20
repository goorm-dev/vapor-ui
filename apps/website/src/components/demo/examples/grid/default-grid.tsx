import { Grid } from '@vapor-ui/core';

export default function DefaultGrid() {
    return (
        <Grid.Root templateColumns="repeat(3, 1fr)" gap="4">
            <Grid.Item className="bg-gray-100 p-4 rounded">1</Grid.Item>
            <Grid.Item className="bg-gray-100 p-4 rounded">2</Grid.Item>
            <Grid.Item className="bg-gray-100 p-4 rounded">3</Grid.Item>
            <Grid.Item className="bg-gray-100 p-4 rounded">4</Grid.Item>
            <Grid.Item className="bg-gray-100 p-4 rounded">5</Grid.Item>
            <Grid.Item className="bg-gray-100 p-4 rounded">6</Grid.Item>
        </Grid.Root>
    );
}
