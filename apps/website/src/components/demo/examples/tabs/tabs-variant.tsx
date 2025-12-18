import { Tabs, VStack } from '@vapor-ui/core';

export default function TabsVariant() {
    return (
        <VStack gap="$400">
            <Tabs.Root defaultValue="home" variant="line">
                <h4 className="text-sm font-medium mb-4">Line 변형</h4>
                <Tabs.List className={'max-w-[400px] w-full mx-auto'}>
                    <Tabs.Button value="home">홈</Tabs.Button>
                    <Tabs.Button value="about">소개</Tabs.Button>
                    <Tabs.Button value="services">서비스</Tabs.Button>
                    <Tabs.Indicator />
                </Tabs.List>
            </Tabs.Root>

            <Tabs.Root defaultValue="home" variant="fill">
                <h4 className="text-sm font-medium mb-4">fill 변형</h4>
                <Tabs.List>
                    <Tabs.Button value="home">홈</Tabs.Button>
                    <Tabs.Button value="about">소개</Tabs.Button>
                    <Tabs.Button value="services">서비스</Tabs.Button>
                    <Tabs.Indicator />
                </Tabs.List>
            </Tabs.Root>
        </VStack>
    );
}
