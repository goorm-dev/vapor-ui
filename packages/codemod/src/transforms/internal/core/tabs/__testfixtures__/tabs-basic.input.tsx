import { Tabs } from '@goorm-dev/vapor-core';

export default function Example() {
    return (
        <Tabs>
            <Tabs.List hasBorder={true}>
                <Tabs.Button value="tab1">Tab 1</Tabs.Button>
                <Tabs.Button value="tab2">Tab 2</Tabs.Button>
                <Tabs.Button value="tab3">Tab 3</Tabs.Button>
            </Tabs.List>
            <Tabs.Panel value="tab1">Content 1</Tabs.Panel>
            <Tabs.Panel value="tab2">Content 2</Tabs.Panel>
            <Tabs.Panel value="tab3">Content 3</Tabs.Panel>
        </Tabs>
    );
}
