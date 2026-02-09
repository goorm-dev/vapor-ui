import { HStack, RadioCard, RadioGroup } from '@vapor-ui/core';

export default function DefaultRadioCard() {
    return (
        <RadioGroup.Root name="themes">
            <HStack $styles={{ gap: '$100' }}>
                <RadioCard value="light">Light Theme</RadioCard>
                <RadioCard value="dark">Dark Theme</RadioCard>
                <RadioCard value="system" disabled>
                    System (Disabled)
                </RadioCard>
            </HStack>
        </RadioGroup.Root>
    );
}
