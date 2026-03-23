import { HStack, Tabs, Text, VStack } from '@vapor-ui/core';

export default function TabsOrientation() {
    return (
        <HStack $css={{ gap: '$400', alignItems: 'start' }}>
            <VStack $css={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    horizontal
                </Text>
                <Tabs.Root defaultValue={1} orientation="horizontal">
                    <Tabs.List>
                        <Tabs.Button value={1}>Tab 1</Tabs.Button>
                        <Tabs.Button value={2}>Tab 2</Tabs.Button>
                        <Tabs.Button value={3}>Tab 3</Tabs.Button>
                    </Tabs.List>
                </Tabs.Root>
            </VStack>

            <VStack $css={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    vertical
                </Text>
                <Tabs.Root defaultValue={1} orientation="vertical">
                    <Tabs.List>
                        <Tabs.Button value={1}>Tab 1</Tabs.Button>
                        <Tabs.Button value={2}>Tab 2</Tabs.Button>
                        <Tabs.Button value={3}>Tab 3</Tabs.Button>
                    </Tabs.List>
                </Tabs.Root>
            </VStack>
        </HStack>
    );
}
