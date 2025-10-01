'use client';

import { useState } from 'react';

import { Button, Tabs, VStack } from '@vapor-ui/core';

export default function TabsControlled() {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <VStack gap="$200">
            <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
                <Tabs.List>
                    <Tabs.Trigger value="profile">프로필</Tabs.Trigger>
                    <Tabs.Trigger value="account">계정</Tabs.Trigger>
                    <Tabs.Trigger value="security">보안</Tabs.Trigger>
                    <Tabs.Trigger value="notifications">알림</Tabs.Trigger>
                    <Tabs.Indicator />
                </Tabs.List>
            </Tabs.Root>

            <div className="text-sm text-gray-600">
                현재 선택된 탭: <code className="bg-gray-100 px-1 rounded">{activeTab}</code>
            </div>

            <div className="flex gap-2">
                <Button onClick={() => setActiveTab('account')} className="">
                    계정 탭으로 이동
                </Button>
                <Button color="success" onClick={() => setActiveTab('security')} className="">
                    보안 탭으로 이동
                </Button>
            </div>
        </VStack>
    );
}
