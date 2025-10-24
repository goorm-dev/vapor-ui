import { Tabs } from '@goorm-dev/vapor-core';

export default function Example() {
    const tabsProps = {
        size: 'md',
        direction: 'horizontal',
    };

    return (
        <Tabs {...tabsProps}>
            <Tabs.List>
                <Tabs.Button value="tab1">Tab 1</Tabs.Button>
            </Tabs.List>
            <Tabs.Panel value="tab1">Content 1</Tabs.Panel>
        </Tabs>
    );
}
