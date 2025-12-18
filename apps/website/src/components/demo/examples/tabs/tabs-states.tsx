import { Tabs, VStack } from '@vapor-ui/core';

export default function TabsStates() {
    return (
        <VStack gap="$400">
            <Tabs.Root defaultValue="enabled">
                <h4 className="text-sm font-medium mb-4">개별 탭 비활성화</h4>
                <Tabs.List>
                    <Tabs.Button value="enabled">활성화 탭</Tabs.Button>
                    <Tabs.Button value="disabled" disabled>
                        비활성화 탭
                    </Tabs.Button>
                    <Tabs.Button value="normal">일반 탭</Tabs.Button>
                    <Tabs.Indicator />
                </Tabs.List>
            </Tabs.Root>

            <Tabs.Root defaultValue="enabled" disabled>
                <h4 className="text-sm font-medium mb-4">전체 탭 그룹 비활성화</h4>
                <Tabs.List>
                    <Tabs.Button value="enabled">활성화 탭</Tabs.Button>
                    <Tabs.Button value="disabled">비활성화 탭</Tabs.Button>
                    <Tabs.Button value="normal">일반 탭</Tabs.Button>
                    <Tabs.Indicator />
                </Tabs.List>
            </Tabs.Root>
        </VStack>
    );
}
