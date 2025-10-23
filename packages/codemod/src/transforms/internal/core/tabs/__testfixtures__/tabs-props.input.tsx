import { Tabs } from '@goorm-dev/vapor-core';

export default function Example() {
    return (
        <Tabs size="lg" direction="horizontal" stretch={true} position="center">
            <Tabs.List hasBorder={false}>
                <Tabs.Button value="tab1" align="left">
                    Tab 1
                </Tabs.Button>
                <Tabs.Button value="tab2" align="center">
                    Tab 2
                </Tabs.Button>
            </Tabs.List>
            <Tabs.Panel value="tab1">Content 1</Tabs.Panel>
            <Tabs.Panel value="tab2">Content 2</Tabs.Panel>
        </Tabs>
    );
}
