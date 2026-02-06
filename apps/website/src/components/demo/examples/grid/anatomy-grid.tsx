import { Grid, Text } from '@vapor-ui/core';

export default function AnatomyGrid() {
    return (
        <Grid.Root data-part="Root" templateColumns="1fr 1fr 1fr" gap="$200">
            <Grid.Item data-part="Item">
                <Text typography="body2" foreground="normal-100">
                    Item 1
                </Text>
            </Grid.Item>
            <Grid.Item data-part="Item">
                <Text typography="body2" foreground="normal-100">
                    Item 2
                </Text>
            </Grid.Item>
            <Grid.Item data-part="Item">
                <Text typography="body2" foreground="normal-100">
                    Item 3
                </Text>
            </Grid.Item>
        </Grid.Root>
    );
}
