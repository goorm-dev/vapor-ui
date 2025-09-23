import { Tabs } from '@vapor-ui/core';

const tabsContent = [
    { value: 'enabled', label: '활성화 탭', content: '정상적으로 사용할 수 있는 탭입니다.' },
    { value: 'disabled', label: '비활성화 탭', content: '이 탭은 비활성화되어 있습니다.' },
    { value: 'normal', label: '일반 탭', content: '일반적인 탭입니다.' },
];

export default function TabsStates() {
    return (
        <div className="space-y-8">
            <div>
                <h4 className="text-sm font-medium mb-4">개별 탭 비활성화</h4>
                <Tabs.Root defaultValue="enabled">
                    <Tabs.List>
                        <Tabs.Trigger value="enabled">활성화 탭</Tabs.Trigger>
                        <Tabs.Trigger value="disabled" disabled>
                            비활성화 탭
                        </Tabs.Trigger>
                        <Tabs.Trigger value="normal">일반 탭</Tabs.Trigger>
                        <Tabs.Indicator />
                    </Tabs.List>
                    {tabsContent.map((tab) => (
                        <Tabs.Panel key={tab.value} value={tab.value}>
                            <div className="p-4 border rounded-md">{tab.content}</div>
                        </Tabs.Panel>
                    ))}
                </Tabs.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-4">전체 탭 그룹 비활성화</h4>
                <Tabs.Root defaultValue="enabled" disabled>
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
                            <div className="p-4 border rounded-md">{tab.content}</div>
                        </Tabs.Panel>
                    ))}
                </Tabs.Root>
            </div>
        </div>
    );
}
