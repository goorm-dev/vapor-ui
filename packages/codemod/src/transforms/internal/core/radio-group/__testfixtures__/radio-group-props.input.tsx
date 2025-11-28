// @ts-nocheck
import React from 'react';

import { RadioGroup } from '@goorm-dev/vapor-core';

export function Example() {
    return (
        <RadioGroup size="md" direction="horizontal" invalid={true} defaultSelectedValue="option1">
            <RadioGroup.Item>
                <RadioGroup.Indicator value="option1" />
                <RadioGroup.Label>Option 1</RadioGroup.Label>
            </RadioGroup.Item>
            <RadioGroup.Item>
                <RadioGroup.Indicator value="option2" />
                <RadioGroup.Label>Option 2</RadioGroup.Label>
            </RadioGroup.Item>
        </RadioGroup>
    );
}
