import { Tabs } from '@vapor-ui/core';

export default function Example() {
    return (
        <div>
            <Tabs.Root variant={'line'}>
                <Tabs.List>
                    <Tabs.Trigger value="a1">A1</Tabs.Trigger>
                    <Tabs.Trigger value="a2">A2</Tabs.Trigger>
                    <Tabs.Indicator />
                </Tabs.List>
                <Tabs.Panel value="a1">A1 Content</Tabs.Panel>
                <Tabs.Panel value="a2">A2 Content</Tabs.Panel>
            </Tabs.Root>
            <Tabs.Root variant={'plain'}>
                <Tabs.List>
                    <Tabs.Trigger value="b1">B1</Tabs.Trigger>
                    <Tabs.Trigger value="b2">B2</Tabs.Trigger>
                    <Tabs.Indicator />
                </Tabs.List>
                <Tabs.Panel value="b1">B1 Content</Tabs.Panel>
                <Tabs.Panel value="b2">B2 Content</Tabs.Panel>
            </Tabs.Root>
        </div>
    );
}
