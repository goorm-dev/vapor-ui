import { Checkbox, HStack, Text, VStack } from '@vapor-ui/core';

export default function CheckboxInvalid() {
    return (
        <VStack $styles={{ gap: '$150' }}>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-32" typography="body3" foreground="hint-100">
                    invalid
                </Text>
                <Text render={<label />} typography="body2">
                    <HStack $styles={{ gap: '$100', alignItems: 'center' }}>
                        <Checkbox.Root invalid />
                        Accept terms
                    </HStack>
                </Text>
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-32" typography="body3" foreground="hint-100">
                    invalid checked
                </Text>
                <Text render={<label />} typography="body2">
                    <HStack $styles={{ gap: '$100', alignItems: 'center' }}>
                        <Checkbox.Root invalid checked />
                        Accept terms
                    </HStack>
                </Text>
            </HStack>
        </VStack>
    );
}
