import { Grid, Textarea } from '@vapor-ui/core';

export default function TextareaStates() {
    return (
        <Grid.Root templateColumns="1" gap="$100">
            <Grid.Item>
                <Textarea.Root placeholder="Default state">
                    <Textarea.Field />
                </Textarea.Root>
            </Grid.Item>
            <Grid.Item>
                <Textarea.Root disabled placeholder="Disabled state">
                    <Textarea.Field />
                </Textarea.Root>
            </Grid.Item>
            <Grid.Item>
                <Textarea.Root invalid placeholder="Invalid state">
                    <Textarea.Field />
                </Textarea.Root>
            </Grid.Item>
            <Grid.Item>
                <Textarea.Root readOnly defaultValue="Read only content">
                    <Textarea.Field />
                </Textarea.Root>
            </Grid.Item>
        </Grid.Root>
    );
}
