// @ts-nocheck
import React from 'react';
import { RadioGroup } from '@goorm-dev/vapor-core';

export function Example() {
    return (
        <RadioGroup selectedValue="1" onSelectedValueChange={() => {}}>
            <RadioGroup.Item>
                <RadioGroup.Indicator value="1" />
                <RadioGroup.Label>Option 1</RadioGroup.Label>
            </RadioGroup.Item>
            <RadioGroup.Item disabled>
                <RadioGroup.Indicator value="2" />
                <RadioGroup.Label>Option 2 (Disabled)</RadioGroup.Label>
            </RadioGroup.Item>
        </RadioGroup>
    );
}
