import { HStack, Radio, RadioGroup, Text, VStack } from '@vapor-ui/core';

export default function Flexible() {
    return (
        <RadioGroup.Root name="direction-vertical" defaultValue="v1">
            <RadioGroup.Label>Vertical</RadioGroup.Label>
            <VStack gap="$100">
                <Text render={<label />} typography="body2">
                    <HStack gap="$100" alignItems="center">
                        <Radio.Root value="v1">
                            <Radio.IndicatorPrimitive />
                        </Radio.Root>
                        Option 1
                    </HStack>
                </Text>
                <Text render={<label />} typography="body2">
                    <HStack gap="$100" alignItems="center">
                        <Radio.Root value="v2">
                            <Radio.IndicatorPrimitive />
                        </Radio.Root>
                        Option 2
                    </HStack>
                </Text>
                <Text render={<label />} typography="body2">
                    <HStack gap="$100" alignItems="center">
                        <Radio.Root value="v3">
                            <Radio.IndicatorPrimitive />
                        </Radio.Root>
                        Option 3
                    </HStack>
                </Text>
            </VStack>
        </RadioGroup.Root>
    );
}
