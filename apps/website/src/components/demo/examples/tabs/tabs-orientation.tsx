import { Grid, Tabs } from '@vapor-ui/core';

export default function TabsOrientation() {
    return (
        <Grid.Root gap="$500" templateColumns="1fr 1fr">
            <Grid.Item>
                <h4 className="text-sm font-medium mb-4">수평 (Horizontal)</h4>
                <Tabs.Root defaultValue={1} orientation="horizontal">
                    <Tabs.List>
                        <Tabs.Trigger value={1}>Tab 1</Tabs.Trigger>
                        <Tabs.Trigger value={2}>Tab 2</Tabs.Trigger>
                        <Tabs.Trigger value={3}>Tab 3</Tabs.Trigger>
                        <Tabs.Indicator />
                    </Tabs.List>
                </Tabs.Root>
            </Grid.Item>

            <Grid.Item>
                <h4 className="text-sm font-medium mb-4 flex justify-center">수직 (Vertical)</h4>
                <Tabs.Root defaultValue={1} orientation="vertical" className="flex justify-center">
                    <Tabs.List>
                        <Tabs.Trigger value={1}>Tab 1</Tabs.Trigger>
                        <Tabs.Trigger value={2}>Tab 2</Tabs.Trigger>
                        <Tabs.Trigger value={3}>Tab 3</Tabs.Trigger>
                        <Tabs.Indicator />
                    </Tabs.List>
                </Tabs.Root>
            </Grid.Item>
        </Grid.Root>
    );
}
