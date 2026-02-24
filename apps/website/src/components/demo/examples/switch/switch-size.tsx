import { HStack, Switch, Text, VStack } from '@vapor-ui/core';

export default function SwitchSize() {
    return (
        <VStack $css={{ gap: '$150' }}>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    sm
                </Text>
                <Switch.Root size="sm" />
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    md
                </Text>
                <Switch.Root size="md" />
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    lg
                </Text>
                <Switch.Root size="lg" />
            </HStack>
        </VStack>
    );
}
