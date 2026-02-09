import { Checkbox, HStack, Text, VStack } from '@vapor-ui/core';

export default function CheckboxSize() {
    return (
        <VStack $styles={{ gap: '$150' }}>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-12" typography="body3" foreground="hint-100">
                    md
                </Text>
                <Text render={<label />} typography="body2">
                    <HStack $styles={{ gap: '$100', alignItems: 'center' }}>
                        <Checkbox.Root size="md" />
                        Remember me
                    </HStack>
                </Text>
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-12" typography="body3" foreground="hint-100">
                    lg
                </Text>
                <Text render={<label />} typography="body2">
                    <HStack $styles={{ gap: '$100', alignItems: 'center' }}>
                        <Checkbox.Root size="lg" />
                        Remember me
                    </HStack>
                </Text>
            </HStack>
        </VStack>
    );
}
