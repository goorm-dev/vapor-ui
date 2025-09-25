import { Tabs } from '@vapor-ui/core';

const tabsContent = [
    { value: 'dashboard', label: '대시보드', content: '대시보드 내용을 표시합니다.' },
    { value: 'analytics', label: '분석', content: '분석 데이터를 확인할 수 있습니다.' },
    { value: 'reports', label: '리포트', content: '상세 리포트를 제공합니다.' },
    { value: 'settings', label: '설정', content: '시스템 설정을 관리합니다.' },
];

export default function TabsOrientation() {
    return (
        <div className="space-y-8">
            <div>
                <h4 className="text-sm font-medium mb-4">수평 (Horizontal)</h4>
                <Tabs.Root defaultValue="dashboard" orientation="horizontal">
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
                            <div className="p-4 border border-t-0 rounded-b-md">{tab.content}</div>
                        </Tabs.Panel>
                    ))}
                </Tabs.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-4">수직 (Vertical)</h4>
                <Tabs.Root defaultValue="dashboard" orientation="vertical" className="flex">
                    <Tabs.List>
                        {tabsContent.map((tab) => (
                            <Tabs.Trigger key={tab.value} value={tab.value}>
                                {tab.label}
                            </Tabs.Trigger>
                        ))}
                        <Tabs.Indicator />
                    </Tabs.List>
                    <div className="flex-1">
                        {tabsContent.map((tab) => (
                            <Tabs.Panel key={tab.value} value={tab.value}>
                                <div className="p-4 border border-l-0 rounded-r-md min-h-[120px]">
                                    {tab.content}
                                </div>
                            </Tabs.Panel>
                        ))}
                    </div>
                </Tabs.Root>
            </div>
        </div>
    );
}
