import { HStack, Tabs, Text, VStack } from '@vapor-ui/core';

export default function TabsVariant() {
    return (
        <VStack $styles={{ gap: '$200' }}>
            <HStack $styles={{ gap: '$150', alignItems: 'start' }}>
                <Text className="w-12" typography="body3" foreground="hint-100">
                    line
                </Text>
                <Tabs.Root defaultValue="home" variant="line">
                    <Tabs.List>
                        <Tabs.Button value="home">Home</Tabs.Button>
                        <Tabs.Button value="about">About</Tabs.Button>
                        <Tabs.Button value="services">Services</Tabs.Button>
                    </Tabs.List>
                </Tabs.Root>
            </HStack>

            <HStack $styles={{ gap: '$150', alignItems: 'start' }}>
                <Text className="w-12" typography="body3" foreground="hint-100">
                    fill
                </Text>
                <Tabs.Root defaultValue="home" variant="fill">
                    <Tabs.List>
                        <Tabs.Button value="home">Home</Tabs.Button>
                        <Tabs.Button value="about">About</Tabs.Button>
                        <Tabs.Button value="services">Services</Tabs.Button>
                    </Tabs.List>
                </Tabs.Root>
            </HStack>
        </VStack>
    );
}
