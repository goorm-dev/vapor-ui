import { Tabs } from '@vapor-ui/core';

export default function Example() {
    const tabs = ['tab1', 'tab2', 'tab3'];

    return (
        <Tabs.Root variant={'line'}>
            <Tabs.List>
                {tabs.map((tab) => (
                    <Tabs.Trigger key={tab} value={tab}>
                        {tab}
                    </Tabs.Trigger>
                ))}
                <Tabs.Indicator />
            </Tabs.List>
            {tabs.map((tab) => (
                <Tabs.Panel key={tab} value={tab}>
                    Content {tab}
                </Tabs.Panel>
            ))}
        </Tabs.Root>
    );
}
