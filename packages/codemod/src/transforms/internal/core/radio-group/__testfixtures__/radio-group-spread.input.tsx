// @ts-nocheck
import React from 'react';

import { RadioGroup } from '@goorm-dev/vapor-core';

export function Example() {
    const props = {
        size: 'md' as const,
        invalid: false,
    };

    return (
        <RadioGroup {...props} selectedValue="1">
            <RadioGroup.Item>
                <RadioGroup.Indicator value="1" />
                <RadioGroup.Label>Option 1</RadioGroup.Label>
            </RadioGroup.Item>
        </RadioGroup>
    );
}
