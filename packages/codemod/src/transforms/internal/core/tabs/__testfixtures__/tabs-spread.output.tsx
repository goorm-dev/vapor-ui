import { Tabs } from '@vapor-ui/core';

export default function Example() {
    const tabsProps = {
        size: 'md',
        direction: 'horizontal',
    };

    return (
        <Tabs.Root {...tabsProps} variant="line">
            <Tabs.List>
                <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
                <Tabs.Indicator />
            </Tabs.List>
            <Tabs.Panel value="tab1">Content 1</Tabs.Panel>
        </Tabs.Root>
    );
}
