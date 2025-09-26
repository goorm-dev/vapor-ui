import { Grid, Textarea } from '@vapor-ui/core';

export default function TextareaStates() {
    return (
        <Grid.Root templateColumns="1" gap="$100">
            <Grid.Item>
                <Textarea placeholder="Default state" />
            </Grid.Item>
            <Grid.Item>
                <Textarea disabled placeholder="Disabled state" />
            </Grid.Item>
            <Grid.Item>
                <Textarea invalid placeholder="Invalid state" />
            </Grid.Item>
            <Grid.Item>
                <Textarea readOnly defaultValue="Read only content" />
            </Grid.Item>
        </Grid.Root>
    );
}
