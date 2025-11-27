import { useState } from 'react';

import { Tabs } from '@goorm-dev/vapor-core';

export default function Example() {
    const [activeTab, setActiveTab] = useState('tab1');

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List>
                <Tabs.Button value="tab1">Tab 1</Tabs.Button>
                <Tabs.Button value="tab2">Tab 2</Tabs.Button>
            </Tabs.List>
            <Tabs.Panel forceMount value="tab1" hidden={activeTab !== 'tab1'}>
                Content 1
            </Tabs.Panel>
            <Tabs.Panel forceMount value="tab2" hidden={activeTab !== 'tab2'}>
                Content 2
            </Tabs.Panel>
        </Tabs>
    );
}
