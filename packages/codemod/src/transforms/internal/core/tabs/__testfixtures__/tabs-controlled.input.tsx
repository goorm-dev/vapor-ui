import { useState } from 'react';

import { Tabs } from '@goorm-dev/vapor-core';

export default function Example() {
    const [value, setValue] = useState('tab1');

    return (
        <Tabs value={value} onValueChange={setValue}>
            <Tabs.List>
                <Tabs.Button value="tab1">Tab 1</Tabs.Button>
                <Tabs.Button value="tab2">Tab 2</Tabs.Button>
            </Tabs.List>
            <Tabs.Panel value="tab1">Content 1</Tabs.Panel>
            <Tabs.Panel value="tab2">Content 2</Tabs.Panel>
        </Tabs>
    );
}
