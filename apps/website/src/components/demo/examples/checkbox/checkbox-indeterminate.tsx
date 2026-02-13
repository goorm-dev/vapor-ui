import { Checkbox, HStack, Text, VStack } from '@vapor-ui/core';

export default function CheckboxIndeterminate() {
    return (
        <VStack $css={{ gap: '$150' }}>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-32" typography="body3" foreground="hint-100">
                    unchecked
                </Text>
                <Text render={<label />} typography="body2">
                    <HStack $css={{ gap: '$100', alignItems: 'center' }}>
                        <Checkbox.Root />
                        Select all
                    </HStack>
                </Text>
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-32" typography="body3" foreground="hint-100">
                    indeterminate
                </Text>
                <Text render={<label />} typography="body2">
                    <HStack $css={{ gap: '$100', alignItems: 'center' }}>
                        <Checkbox.Root indeterminate />
                        Select all
                    </HStack>
                </Text>
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-32" typography="body3" foreground="hint-100">
                    checked
                </Text>
                <Text render={<label />} typography="body2">
                    <HStack $css={{ gap: '$100', alignItems: 'center' }}>
                        <Checkbox.Root checked />
                        Select all
                    </HStack>
                </Text>
            </HStack>
        </VStack>
    );
}
