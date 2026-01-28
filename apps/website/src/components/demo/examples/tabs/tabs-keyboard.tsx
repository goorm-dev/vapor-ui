import { Tabs, VStack } from '@vapor-ui/core';

export default function TabsKeyboard() {
    return (
        <VStack gap="$400">
            <Tabs.Root defaultValue="tab1" activateOnFocus={true}>
                <h4 className="text-sm font-medium mb-4">
                    포커스 시 활성화 <code>(activateOnFocus: true)</code>
                </h4>
                <Tabs.List>
                    <Tabs.Button value="tab1">탭 1</Tabs.Button>
                    <Tabs.Button value="tab2">탭 2</Tabs.Button>
                    <Tabs.Button value="tab3">탭 3</Tabs.Button>
                </Tabs.List>
            </Tabs.Root>

            <Tabs.Root defaultValue="tab1" activateOnFocus={false}>
                <h4 className="text-sm font-medium mb-4">
                    엔터/스페이스로 활성화 <code>(activateOnFocus: false)</code>
                </h4>
                <Tabs.List>
                    <Tabs.Button value="tab1">탭 1</Tabs.Button>
                    <Tabs.Button value="tab2">탭 2</Tabs.Button>
                    <Tabs.Button value="tab3">탭 3</Tabs.Button>
                </Tabs.List>
            </Tabs.Root>

            <Tabs.Root defaultValue="tab1" loopFocus={false} activateOnFocus={false}>
                <h4 className="text-sm font-medium mb-4">
                    비순환 내비게이션 <code>(loopFocus: false)</code>
                </h4>
                <Tabs.List>
                    <Tabs.Button value="tab1">탭 1</Tabs.Button>
                    <Tabs.Button value="tab2">탭 2</Tabs.Button>
                    <Tabs.Button value="tab3">탭 3</Tabs.Button>
                </Tabs.List>
            </Tabs.Root>
        </VStack>
    );
}
