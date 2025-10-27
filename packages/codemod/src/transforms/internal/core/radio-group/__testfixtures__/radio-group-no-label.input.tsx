// @ts-nocheck
import React from 'react';

import { RadioGroup } from '@goorm-dev/vapor-core';

export function Example() {
    return (
        <RadioGroup selectedValue="option1">
            <RadioGroup.Item>
                <RadioGroup.Indicator value="option1" />
            </RadioGroup.Item>
            <RadioGroup.Item>
                <RadioGroup.Indicator value="option2" />
            </RadioGroup.Item>
            <RadioGroup.Item>
                <RadioGroup.Indicator value="option3" />
            </RadioGroup.Item>
        </RadioGroup>
    );
}
