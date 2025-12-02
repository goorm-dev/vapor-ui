import { Tabs } from '@goorm-dev/vapor-core';

export default function Example() {
    const tabs = ['tab1', 'tab2', 'tab3'];

    return (
        <Tabs>
            <Tabs.List>
                {tabs.map((tab) => (
                    <Tabs.Button key={tab} value={tab}>
                        {tab}
                    </Tabs.Button>
                ))}
            </Tabs.List>
            {tabs.map((tab) => (
                <Tabs.Panel key={tab} value={tab}>
                    Content {tab}
                </Tabs.Panel>
            ))}
        </Tabs>
    );
}
