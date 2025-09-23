'use client';

import { useState } from 'react';

import { Tabs } from '@vapor-ui/core';

const tabsContent = [
    { value: 'profile', label: '프로필', content: '사용자 프로필 정보를 관리합니다.' },
    { value: 'account', label: '계정', content: '계정 설정을 변경할 수 있습니다.' },
    { value: 'security', label: '보안', content: '보안 설정을 확인하고 수정합니다.' },
    { value: 'notifications', label: '알림', content: '알림 설정을 관리합니다.' },
];

export default function TabsControlled() {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className="space-y-4">
            <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
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

            <div className="text-sm text-gray-600">
                현재 선택된 탭: <code className="bg-gray-100 px-1 rounded">{activeTab}</code>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab('account')}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    계정 탭으로 이동
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                >
                    보안 탭으로 이동
                </button>
            </div>
        </div>
    );
}
