import { HStack, Tabs, Text, VStack } from '@vapor-ui/core';

export default function TabsSize() {
    return (
        <VStack $css={{ gap: '$200' }}>
            <HStack $css={{ gap: '$150', alignItems: 'start' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    sm
                </Text>
                <Tabs.Root defaultValue="tab1" size="sm">
                    <Tabs.List>
                        <Tabs.Button value="tab1">Tab 1</Tabs.Button>
                        <Tabs.Button value="tab2">Tab 2</Tabs.Button>
                        <Tabs.Button value="tab3">Tab 3</Tabs.Button>
                    </Tabs.List>
                </Tabs.Root>
            </HStack>

            <HStack $css={{ gap: '$150', alignItems: 'start' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    md
                </Text>
                <Tabs.Root defaultValue="tab1" size="md">
                    <Tabs.List>
                        <Tabs.Button value="tab1">Tab 1</Tabs.Button>
                        <Tabs.Button value="tab2">Tab 2</Tabs.Button>
                        <Tabs.Button value="tab3">Tab 3</Tabs.Button>
                    </Tabs.List>
                </Tabs.Root>
            </HStack>

            <HStack $css={{ gap: '$150', alignItems: 'start' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    lg
                </Text>
                <Tabs.Root defaultValue="tab1" size="lg">
                    <Tabs.List>
                        <Tabs.Button value="tab1">Tab 1</Tabs.Button>
                        <Tabs.Button value="tab2">Tab 2</Tabs.Button>
                        <Tabs.Button value="tab3">Tab 3</Tabs.Button>
                    </Tabs.List>
                </Tabs.Root>
            </HStack>

            <HStack $css={{ gap: '$150', alignItems: 'start' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    xl
                </Text>
                <Tabs.Root defaultValue="tab1" size="xl">
                    <Tabs.List>
                        <Tabs.Button value="tab1">Tab 1</Tabs.Button>
                        <Tabs.Button value="tab2">Tab 2</Tabs.Button>
                        <Tabs.Button value="tab3">Tab 3</Tabs.Button>
                    </Tabs.List>
                </Tabs.Root>
            </HStack>
        </VStack>
    );
}
