import { Tabs } from '@vapor-ui/core';

export default function Example() {
    return (
        <Tabs.Root variant={'plain'}>
            <Tabs.List>
                <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
                <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
                <Tabs.Indicator />
            </Tabs.List>
            <Tabs.Panel value="tab1">Content 1</Tabs.Panel>
            <Tabs.Panel value="tab2">Content 2</Tabs.Panel>
        </Tabs.Root>
    );
}
