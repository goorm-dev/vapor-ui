import { HStack, RadioCard, RadioGroup } from '@vapor-ui/core';

export default function RadioCardSize() {
    return (
        <div className="space-y-6">
            <RadioGroup.Root name="size-md" size="md">
                <RadioGroup.Label>Medium</RadioGroup.Label>
                <HStack gap="$100">
                    <RadioCard value="md1">Medium Option 1</RadioCard>
                    <RadioCard value="md2">Medium Option 2</RadioCard>
                </HStack>
            </RadioGroup.Root>

            <RadioGroup.Root name="size-lg" size="lg">
                <RadioGroup.Label>Large</RadioGroup.Label>
                <HStack gap="$100">
                    <RadioCard value="lg1">Large Option 1</RadioCard>
                    <RadioCard value="lg2">Large Option 2</RadioCard>
                </HStack>
            </RadioGroup.Root>
        </div>
    );
}
