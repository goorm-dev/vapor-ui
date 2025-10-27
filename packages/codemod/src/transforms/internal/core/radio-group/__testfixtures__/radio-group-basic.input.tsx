// @ts-nocheck
import React from 'react';

import { RadioGroup } from '@goorm-dev/vapor-core';

export function Example() {
    return (
        <RadioGroup defaultSelectedValue="1">
            <RadioGroup.Item>
                <RadioGroup.Indicator value="1" />
            </RadioGroup.Item>
            <RadioGroup.Item>
                <RadioGroup.Indicator value="2" />
            </RadioGroup.Item>
        </RadioGroup>
    );
}
