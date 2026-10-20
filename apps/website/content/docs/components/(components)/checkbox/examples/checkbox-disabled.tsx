import { Checkbox, HStack, Text, VStack } from '@vapor-ui/core';

export default function CheckboxDisabled() {
    return (
        <VStack $css={{ gap: '$150' }}>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-32" typography="body3" foreground="hint-100">
                    disabled
                </Text>
                <Text render={<label />} typography="body2">
                    <HStack $css={{ gap: '$100', alignItems: 'center' }}>
                        <Checkbox.Root disabled />
                        Remember me
                    </HStack>
                </Text>
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-32" typography="body3" foreground="hint-100">
                    disabled checked
                </Text>
                <Text render={<label />} typography="body2">
                    <HStack $css={{ gap: '$100', alignItems: 'center' }}>
                        <Checkbox.Root disabled checked />
                        Remember me
                    </HStack>
                </Text>
            </HStack>
        </VStack>
    );
}
