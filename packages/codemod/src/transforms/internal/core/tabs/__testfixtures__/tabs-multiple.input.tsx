import { Tabs } from '@goorm-dev/vapor-core';

export default function Example() {
    return (
        <div>
            <Tabs>
                <Tabs.List>
                    <Tabs.Button value="a1">A1</Tabs.Button>
                    <Tabs.Button value="a2">A2</Tabs.Button>
                </Tabs.List>
                <Tabs.Panel value="a1">A1 Content</Tabs.Panel>
                <Tabs.Panel value="a2">A2 Content</Tabs.Panel>
            </Tabs>

            <Tabs>
                <Tabs.List hasBorder={false}>
                    <Tabs.Button value="b1">B1</Tabs.Button>
                    <Tabs.Button value="b2">B2</Tabs.Button>
                </Tabs.List>
                <Tabs.Panel value="b1">B1 Content</Tabs.Panel>
                <Tabs.Panel value="b2">B2 Content</Tabs.Panel>
            </Tabs>
        </div>
    );
}
