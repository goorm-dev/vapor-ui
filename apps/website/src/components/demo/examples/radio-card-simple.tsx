import { useState } from 'react';

import { HStack, RadioCard, RadioGroup } from '@vapor-ui/core';

export default function RadioCardSimple() {
    const [value, setValue] = useState('option1');

    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-600">선택된 값: {value}</p>
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
        </div>
    );
}
