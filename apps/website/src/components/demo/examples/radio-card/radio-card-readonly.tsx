import { HStack, RadioCard, RadioGroup, Text, VStack } from '@vapor-ui/core';

export default function RadioCardReadonly() {
    return (
        <VStack $styles={{ gap: '$300' }}>
            <VStack $styles={{ gap: '$100' }}>
                <Text typography="body3" foreground="hint-100">
                    readOnly
                </Text>
                <RadioGroup.Root name="readonly-group" readOnly defaultValue="selected">
                    <HStack $styles={{ gap: '$100' }}>
                        <RadioCard value="unselected">Unselected Option</RadioCard>
                        <RadioCard value="selected">Selected Option (Read Only)</RadioCard>
                        <RadioCard value="another">Another Option</RadioCard>
                    </HStack>
                </RadioGroup.Root>
            </VStack>

            <VStack $styles={{ gap: '$100' }}>
                <Text typography="body3" foreground="hint-100">
                    normal
                </Text>
                <RadioGroup.Root name="normal-group" defaultValue="selected-normal">
                    <HStack $styles={{ gap: '$100' }}>
                        <RadioCard value="unselected-normal">Unselected Option</RadioCard>
                        <RadioCard value="selected-normal">Selected Option (Editable)</RadioCard>
                        <RadioCard value="another-normal">Another Option</RadioCard>
                    </HStack>
                </RadioGroup.Root>
            </VStack>
        </VStack>
    );
}
