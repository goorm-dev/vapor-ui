// @ts-nocheck
import React from 'react';

import { RadioGroup } from '@goorm-dev/vapor-core';

export function Example() {
    return (
        <RadioGroup value="1">
            <RadioGroup.Item key="item1">
                <RadioGroup.Label>Label Only</RadioGroup.Label>
            </RadioGroup.Item>
        </RadioGroup>
    );
}
