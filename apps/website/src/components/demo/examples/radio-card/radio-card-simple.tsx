import { useState } from 'react';

import { HStack, RadioCard, RadioGroup, Text, VStack } from '@vapor-ui/core';

export default function RadioCardSimple() {
    const [value, setValue] = useState('option1');

    return (
        <VStack gap="$150">
            <Text typography="body3" foreground="hint-100">
                Selected: {value}
            </Text>
            <RadioGroup.Root
                name="simple-radio-card"
                value={value}
                onValueChange={(newValue) => setValue(newValue as string)}
            >
                <HStack gap="$100">
                    <RadioCard value="option1">First Option</RadioCard>
                    <RadioCard value="option2">Second Option</RadioCard>
                    <RadioCard value="option3">Third Option</RadioCard>
                </HStack>
            </RadioGroup.Root>
        </VStack>
    );
}
