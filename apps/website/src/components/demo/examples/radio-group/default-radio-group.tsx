import { HStack, Radio, RadioGroup, Text, VStack } from '@vapor-ui/core';

export default function DefaultRadioGroup() {
    return (
        <RadioGroup.Root name="fruits">
            <VStack $css={{ gap: '$100' }}>
                <Text render={<label />} typography="body2">
                    <HStack $css={{ gap: '$100', alignItems: 'center' }}>
                        <Radio.Root value="apple" />
                        Apple
                    </HStack>
                </Text>
                <Text render={<label />} typography="body2">
                    <HStack $css={{ gap: '$100', alignItems: 'center' }}>
                        <Radio.Root value="orange" />
                        Orange
                    </HStack>
                </Text>
                <Text render={<label />} typography="body2">
                    <HStack $css={{ gap: '$100', alignItems: 'center' }}>
                        <Radio.Root value="banana" disabled />
                        Banana (Disabled)
                    </HStack>
                </Text>
            </VStack>
        </RadioGroup.Root>
    );
}
