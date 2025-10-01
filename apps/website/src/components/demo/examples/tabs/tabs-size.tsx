import { Tabs, VStack } from '@vapor-ui/core';

export default function TabsSize() {
    return (
        <VStack gap="$400">
            <Tabs.Root defaultValue="tab1" size="sm">
                <h4 className="text-sm font-medium mb-2">Small</h4>
                <Tabs.List>
                    <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
                    <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
                    <Tabs.Trigger value="tab3">Tab 3</Tabs.Trigger>
                    <Tabs.Indicator />
                </Tabs.List>
            </Tabs.Root>

            <Tabs.Root defaultValue="tab1" size="md">
                <h4 className="text-sm font-medium mb-2">Medium</h4>
                <Tabs.List>
                    <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
                    <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
                    <Tabs.Trigger value="tab3">Tab 3</Tabs.Trigger>
                    <Tabs.Indicator />
                </Tabs.List>
            </Tabs.Root>

            <Tabs.Root defaultValue="tab1" size="lg">
                <h4 className="text-sm font-medium mb-2">Large</h4>
                <Tabs.List>
                    <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
                    <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
                    <Tabs.Trigger value="tab3">Tab 3</Tabs.Trigger>
                    <Tabs.Indicator />
                </Tabs.List>
            </Tabs.Root>

            <Tabs.Root defaultValue="tab1" size="xl">
                <h4 className="text-sm font-medium mb-2">Extra Large</h4>
                <Tabs.List>
                    <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
                    <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
                    <Tabs.Trigger value="tab3">Tab 3</Tabs.Trigger>
                    <Tabs.Indicator />
                </Tabs.List>
            </Tabs.Root>
        </VStack>
    );
}
