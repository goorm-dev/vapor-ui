import { HStack, Switch, Text, VStack } from '@vapor-ui/core';

export default function SwitchChecked() {
    return (
        <VStack $css={{ gap: '$150' }}>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-20" typography="body3" foreground="hint-100">
                    unchecked
                </Text>
                <Switch.Root />
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-20" typography="body3" foreground="hint-100">
                    checked
                </Text>
                <Switch.Root defaultChecked />
            </HStack>
        </VStack>
    );
}
