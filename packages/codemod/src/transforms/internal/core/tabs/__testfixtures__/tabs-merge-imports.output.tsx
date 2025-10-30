import { Button, Tabs } from '@vapor-ui/core';

export default function Example() {
    return (
        <>
            <Button>Click</Button>
            <Tabs.Root variant="line">
                <Tabs.List>
                    <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
                    <Tabs.Indicator />
                </Tabs.List>
                <Tabs.Panel value="tab1">Content 1</Tabs.Panel>
            </Tabs.Root>
        </>
    );
}
