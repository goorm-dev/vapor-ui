'use client';

import { useState } from 'react';

import { Button, Tabs, VStack } from '@vapor-ui/core';

export default function TabsControlled() {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <VStack $styles={{ gap: '$200' }}>
            <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
                <Tabs.List>
                    <Tabs.Button value="profile">프로필</Tabs.Button>
                    <Tabs.Button value="account">계정</Tabs.Button>
                    <Tabs.Button value="security">보안</Tabs.Button>
                    <Tabs.Button value="notifications">알림</Tabs.Button>
                </Tabs.List>
            </Tabs.Root>

            <div className="text-sm text-gray-600">
                현재 선택된 탭: <code className="bg-gray-100 px-1 rounded">{activeTab}</code>
            </div>

            <div className="flex gap-2">
                <Button onClick={() => setActiveTab('account')} className="">
                    계정 탭으로 이동
                </Button>
                <Button
                    colorPalette="success"
                    onClick={() => setActiveTab('security')}
                    className=""
                >
                    보안 탭으로 이동
                </Button>
            </div>
        </VStack>
    );
}
