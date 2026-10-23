import { HStack, Tabs, Text, VStack } from '@vapor-ui/core';

export default function TabsStates() {
    return (
        <VStack $css={{ gap: '$200' }}>
            <HStack $css={{ gap: '$150', alignItems: 'start' }}>
                <Text className="w-32" typography="body3" foreground="hint-100">
                    tab disabled
                </Text>
                <Tabs.Root defaultValue="enabled">
                    <Tabs.List>
                        <Tabs.Button value="enabled">Enabled</Tabs.Button>
                        <Tabs.Button value="disabled" disabled>
                            Disabled
                        </Tabs.Button>
                        <Tabs.Button value="normal">Normal</Tabs.Button>
                    </Tabs.List>
                </Tabs.Root>
            </HStack>

            <HStack $css={{ gap: '$150', alignItems: 'start' }}>
                <Text className="w-32" typography="body3" foreground="hint-100">
                    group disabled
                </Text>
                <Tabs.Root defaultValue="enabled" disabled>
                    <Tabs.List>
                        <Tabs.Button value="enabled">Enabled</Tabs.Button>
                        <Tabs.Button value="disabled">Disabled</Tabs.Button>
                        <Tabs.Button value="normal">Normal</Tabs.Button>
                    </Tabs.List>
                </Tabs.Root>
            </HStack>
        </VStack>
    );
}
