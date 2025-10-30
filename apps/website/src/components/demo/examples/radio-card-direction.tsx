import { HStack, RadioCard, RadioGroup, VStack } from '@vapor-ui/core';

export default function RadioCardDirection() {
    return (
        <div className="space-y-6">
            <RadioGroup.Root name="orientation-vertical" orientation="vertical">
                <RadioGroup.Label>Vertical (기본값)</RadioGroup.Label>
                <VStack gap="$100">
                    <RadioCard value="v1">Option 1</RadioCard>
                    <RadioCard value="v2">Option 2</RadioCard>
                    <RadioCard value="v3">Option 3</RadioCard>
                </VStack>
            </RadioGroup.Root>

            <RadioGroup.Root name="orientation-horizontal" orientation="horizontal">
                <RadioGroup.Label>Horizontal</RadioGroup.Label>
                <HStack gap="$100">
                    <RadioCard value="h1">Option 1</RadioCard>
                    <RadioCard value="h2">Option 2</RadioCard>
                    <RadioCard value="h3">Option 3</RadioCard>
                </HStack>
            </RadioGroup.Root>
        </div>
    );
}