// @ts-nocheck
import React from 'react';
import { RadioGroup } from '@goorm-dev/vapor-core';

export function Example() {
    const options = ['option1', 'option2', 'option3'];

    return (
        <RadioGroup selectedValue={options[0]}>
            {options.map((opt) => (
                <RadioGroup.Item key={opt}>
                    <RadioGroup.Indicator value={opt} />
                    <RadioGroup.Label>{opt}</RadioGroup.Label>
                </RadioGroup.Item>
            ))}
        </RadioGroup>
    );
}
