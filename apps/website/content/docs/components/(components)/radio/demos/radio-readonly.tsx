import { HStack, Radio, RadioGroup, Text, VStack } from '@vapor-ui/core';

export default function RadioReadOnly() {
    return (
        <RadioGroup.Root name="readonly-fruits" defaultValue="apple">
            <VStack $css={{ gap: '$100' }}>
                <Text render={<label />} typography="body2">
                    <HStack $css={{ gap: '$100', alignItems: 'center' }}>
                        <Radio.Root value="apple" readOnly />
                        Read Only (Selected)
                    </HStack>
                </Text>
                <Text render={<label />} typography="body2">
                    <HStack $css={{ gap: '$100', alignItems: 'center' }}>
                        <Radio.Root value="orange" readOnly />
                        Read Only (Unselected)
                    </HStack>
                </Text>
            </VStack>
        </RadioGroup.Root>
    );
}
