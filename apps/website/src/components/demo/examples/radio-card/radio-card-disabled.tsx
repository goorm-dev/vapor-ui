import { HStack, RadioCard, RadioGroup, Text, VStack } from '@vapor-ui/core';

export default function RadioCardDisabled() {
    return (
        <VStack gap="$300">
            <VStack gap="$100">
                <Text typography="body3" foreground="hint-100">
                    group disabled
                </Text>
                <RadioGroup.Root name="disabled-group" disabled>
                    <HStack gap="$100">
                        <RadioCard value="option1">Option 1</RadioCard>
                        <RadioCard value="option2">Option 2</RadioCard>
                        <RadioCard value="option3">Option 3</RadioCard>
                    </HStack>
                </RadioGroup.Root>
            </VStack>

            <VStack gap="$100">
                <Text typography="body3" foreground="hint-100">
                    individual card disabled
                </Text>
                <RadioGroup.Root name="individual-disabled">
                    <HStack gap="$100">
                        <RadioCard value="enabled1">Enabled Option</RadioCard>
                        <RadioCard value="disabled1" disabled>
                            Disabled Option
                        </RadioCard>
                        <RadioCard value="enabled2">Another Enabled Option</RadioCard>
                    </HStack>
                </RadioGroup.Root>
            </VStack>
        </VStack>
    );
}
