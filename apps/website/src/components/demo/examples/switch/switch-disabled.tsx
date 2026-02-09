import { HStack, Switch, Text, VStack } from '@vapor-ui/core';

export default function SwitchDisabled() {
    return (
        <VStack $styles={{ gap: '$150' }}>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-20" typography="body3" foreground="hint-100">
                    unchecked
                </Text>
                <Switch.Root disabled />
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-20" typography="body3" foreground="hint-100">
                    checked
                </Text>
                <Switch.Root disabled defaultChecked />
            </HStack>
        </VStack>
    );
}
