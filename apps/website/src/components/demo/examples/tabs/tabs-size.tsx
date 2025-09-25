import { Tabs } from '@vapor-ui/core';

const tabsContent = [
    { value: 'tab1', label: '탭 1', content: '첫 번째 탭의 내용입니다.' },
    { value: 'tab2', label: '탭 2', content: '두 번째 탭의 내용입니다.' },
    { value: 'tab3', label: '탭 3', content: '세 번째 탭의 내용입니다.' },
];

export default function TabsSize() {
    return (
        <div className="space-y-8">
            <div>
                <h4 className="text-sm font-medium mb-2">Small</h4>
                <Tabs.Root defaultValue="tab1" size="sm">
                    <Tabs.List>
                        {tabsContent.map((tab) => (
                            <Tabs.Trigger key={tab.value} value={tab.value}>
                                {tab.label}
                            </Tabs.Trigger>
                        ))}
                        <Tabs.Indicator />
                    </Tabs.List>
                    {tabsContent.map((tab) => (
                        <Tabs.Panel key={tab.value} value={tab.value}>
                            <div className="p-2 text-sm">{tab.content}</div>
                        </Tabs.Panel>
                    ))}
                </Tabs.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">Medium</h4>
                <Tabs.Root defaultValue="tab1" size="md">
                    <Tabs.List>
                        {tabsContent.map((tab) => (
                            <Tabs.Trigger key={tab.value} value={tab.value}>
                                {tab.label}
                            </Tabs.Trigger>
                        ))}
                        <Tabs.Indicator />
                    </Tabs.List>
                    {tabsContent.map((tab) => (
                        <Tabs.Panel key={tab.value} value={tab.value}>
                            <div className="p-3 text-sm">{tab.content}</div>
                        </Tabs.Panel>
                    ))}
                </Tabs.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">Large</h4>
                <Tabs.Root defaultValue="tab1" size="lg">
                    <Tabs.List>
                        {tabsContent.map((tab) => (
                            <Tabs.Trigger key={tab.value} value={tab.value}>
                                {tab.label}
                            </Tabs.Trigger>
                        ))}
                        <Tabs.Indicator />
                    </Tabs.List>
                    {tabsContent.map((tab) => (
                        <Tabs.Panel key={tab.value} value={tab.value}>
                            <div className="p-4 text-base">{tab.content}</div>
                        </Tabs.Panel>
                    ))}
                </Tabs.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">Extra Large</h4>
                <Tabs.Root defaultValue="tab1" size="xl">
                    <Tabs.List>
                        {tabsContent.map((tab) => (
                            <Tabs.Trigger key={tab.value} value={tab.value}>
                                {tab.label}
                            </Tabs.Trigger>
                        ))}
                        <Tabs.Indicator />
                    </Tabs.List>
                    {tabsContent.map((tab) => (
                        <Tabs.Panel key={tab.value} value={tab.value}>
                            <div className="p-4 text-base">{tab.content}</div>
                        </Tabs.Panel>
                    ))}
                </Tabs.Root>
            </div>
        </div>
    );
}
