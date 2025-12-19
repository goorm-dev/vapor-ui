'use client';

import { useState } from 'react';

import { Tabs, Text, VStack } from '@vapor-ui/core';

const CONTENT_MAP = {
    home: { title: '홈', description: '홈 페이지 콘텐츠입니다.' },
    about: { title: '소개', description: '회사 소개 콘텐츠입니다.' },
    services: { title: '서비스', description: '서비스 안내 콘텐츠입니다.' },
} as const;

export default function TabsWithoutPanel() {
    const [activeTab, setActiveTab] = useState<keyof typeof CONTENT_MAP>('home');

    return (
        <VStack gap="$300">
            <Tabs.Root
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as keyof typeof CONTENT_MAP)}
            >
                <Tabs.List>
                    <Tabs.Button value="home">홈</Tabs.Button>
                    <Tabs.Button value="about">소개</Tabs.Button>
                    <Tabs.Button value="services">서비스</Tabs.Button>
                </Tabs.List>
            </Tabs.Root>

            <VStack padding="$400" border="1px solid" borderColor="$gray-200" borderRadius="$300">
                <Text typography="heading4">{CONTENT_MAP[activeTab].title}</Text>
                <Text typography="body2">{CONTENT_MAP[activeTab].description}</Text>
            </VStack>
        </VStack>
    );
}
