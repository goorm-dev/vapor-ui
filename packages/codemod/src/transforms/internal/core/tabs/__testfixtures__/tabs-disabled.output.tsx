import { Tabs } from '@vapor-ui/core';

export default function Example() {
    return (
        <Tabs.Root variant={'line'}>
            <Tabs.List>
                <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
                <Tabs.Trigger value="tab2" disabled>
                    Tab 2
                </Tabs.Trigger>
                <Tabs.Trigger value="tab3">Tab 3</Tabs.Trigger>
                <Tabs.Indicator />
            </Tabs.List>
            <Tabs.Panel value="tab1">Content 1</Tabs.Panel>
            <Tabs.Panel value="tab2">Content 2</Tabs.Panel>
            <Tabs.Panel value="tab3">Content 3</Tabs.Panel>
        </Tabs.Root>
    );
}
