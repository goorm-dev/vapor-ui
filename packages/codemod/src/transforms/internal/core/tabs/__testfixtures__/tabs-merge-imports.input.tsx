import { Tabs } from '@goorm-dev/vapor-core';
import { Button } from '@vapor-ui/core';

export default function Example() {
    return (
        <>
            <Button>Click</Button>
            <Tabs>
                <Tabs.List>
                    <Tabs.Button value="tab1">Tab 1</Tabs.Button>
                </Tabs.List>
                <Tabs.Panel value="tab1">Content 1</Tabs.Panel>
            </Tabs>
        </>
    );
}
