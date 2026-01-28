import { HStack, RadioCard, RadioGroup, Text, VStack } from '@vapor-ui/core';

export default function RadioCardSize() {
    return (
        <VStack gap="$150">
            <HStack gap="$150" alignItems="flex-start">
                <Text className="w-6" typography="body3" foreground="hint-100">
                    md
                </Text>
                <RadioGroup.Root name="size-md" size="md">
                    <HStack gap="$100">
                        <RadioCard value="md1">Medium Option 1</RadioCard>
                        <RadioCard value="md2">Medium Option 2</RadioCard>
                    </HStack>
                </RadioGroup.Root>
            </HStack>
            <HStack gap="$150" alignItems="flex-start">
                <Text className="w-6" typography="body3" foreground="hint-100">
                    lg
                </Text>
                <RadioGroup.Root name="size-lg" size="lg">
                    <HStack gap="$100">
                        <RadioCard value="lg1">Large Option 1</RadioCard>
                        <RadioCard value="lg2">Large Option 2</RadioCard>
                    </HStack>
                </RadioGroup.Root>
            </HStack>
        </VStack>
    );
}
