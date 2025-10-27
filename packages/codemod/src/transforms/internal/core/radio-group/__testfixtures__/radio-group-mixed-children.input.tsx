// @ts-nocheck
import React from 'react';

import { RadioGroup } from '@goorm-dev/vapor-core';

export function Example() {
    const extraContent = 'Extra info';
    return (
        <RadioGroup value="1">
            <RadioGroup.Item>
                <RadioGroup.Indicator value="1" />
                <RadioGroup.Label>Option 1</RadioGroup.Label>
                Some text content
                {extraContent}
            </RadioGroup.Item>
        </RadioGroup>
    );
}
