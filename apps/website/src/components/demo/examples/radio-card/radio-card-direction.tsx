import { HStack, RadioCard, RadioGroup, Text, VStack } from '@vapor-ui/core';

export default function RadioCardDirection() {
    return (
        <VStack gap="$300">
            <VStack gap="$100">
                <Text typography="body3" foreground="hint-100">
                    vertical
                </Text>
                <RadioGroup.Root name="orientation-vertical">
                    <VStack gap="$100">
                        <RadioCard value="v1">Option 1</RadioCard>
                        <RadioCard value="v2">Option 2</RadioCard>
                        <RadioCard value="v3">Option 3</RadioCard>
                    </VStack>
                </RadioGroup.Root>
            </VStack>

            <VStack gap="$100">
                <Text typography="body3" foreground="hint-100">
                    horizontal
                </Text>
                <RadioGroup.Root name="orientation-horizontal">
                    <HStack gap="$100">
                        <RadioCard value="h1">Option 1</RadioCard>
                        <RadioCard value="h2">Option 2</RadioCard>
                        <RadioCard value="h3">Option 3</RadioCard>
                    </HStack>
                </RadioGroup.Root>
            </VStack>
        </VStack>
    );
}
