import { Tabs } from '@vapor-ui/core';

const tabsContent = [
    { value: 'home', label: '홈', content: '홈 페이지의 내용입니다.' },
    { value: 'about', label: '소개', content: '회사 소개 내용입니다.' },
    { value: 'services', label: '서비스', content: '제공하는 서비스 안내입니다.' },
    { value: 'contact', label: '연락처', content: '연락처 정보입니다.' },
];

export default function TabsVariant() {
    return (
        <div className="space-y-8">
            <div>
                <h4 className="text-sm font-medium mb-4">Line 변형</h4>
                <Tabs.Root defaultValue="home" variant="line">
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
                            <div className="p-4">{tab.content}</div>
                        </Tabs.Panel>
                    ))}
                </Tabs.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-4">Plain 변형</h4>
                <Tabs.Root defaultValue="home" variant="plain">
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
                            <div className="p-4">{tab.content}</div>
                        </Tabs.Panel>
                    ))}
                </Tabs.Root>
            </div>
        </div>
    );
}
