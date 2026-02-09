import { Checkbox, HStack, Text, VStack } from '@vapor-ui/core';

export default function CheckboxReadOnly() {
    return (
        <VStack $styles={{ gap: '$150' }}>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-32" typography="body3" foreground="hint-100">
                    unchecked
                </Text>
                <Checkbox.Root readOnly />
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-32" typography="body3" foreground="hint-100">
                    checked
                </Text>
                <Checkbox.Root readOnly defaultChecked />
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-32" typography="body3" foreground="hint-100">
                    indeterminate
                </Text>
                <Checkbox.Root readOnly indeterminate />
            </HStack>
        </VStack>
    );
}
