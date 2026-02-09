import { HStack, Radio, Text, VStack } from '@vapor-ui/core';

export default function RadioStates() {
    return (
        <VStack $styles={{ gap: '$150' }}>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-20" typography="body3" foreground="hint-100">
                    default
                </Text>
                <Text render={<label />} typography="body2">
                    <HStack $styles={{ gap: '$100', alignItems: 'center' }}>
                        <Radio.Root value="normal" />
                        Normal
                    </HStack>
                </Text>
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-20" typography="body3" foreground="hint-100">
                    disabled
                </Text>
                <Text render={<label />} typography="body2">
                    <HStack $styles={{ gap: '$100', alignItems: 'center' }}>
                        <Radio.Root value="disabled" disabled />
                        Disabled
                    </HStack>
                </Text>
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-20" typography="body3" foreground="hint-100">
                    invalid
                </Text>
                <Text render={<label />} typography="body2">
                    <HStack $styles={{ gap: '$100', alignItems: 'center' }}>
                        <Radio.Root value="invalid" invalid />
                        Invalid
                    </HStack>
                </Text>
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-20" typography="body3" foreground="hint-100">
                    readOnly
                </Text>
                <Text render={<label />} typography="body2">
                    <HStack $styles={{ gap: '$100', alignItems: 'center' }}>
                        <Radio.Root value="readonly" readOnly />
                        Read Only
                    </HStack>
                </Text>
            </HStack>
        </VStack>
    );
}
