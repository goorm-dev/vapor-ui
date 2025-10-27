// @ts-nocheck
import React from 'react';

import { RadioGroup } from '@goorm-dev/vapor-core';

export function Example() {
    return (
        <RadioGroup value="1">
            <RadioGroup.Item disabled>
                <RadioGroup.Indicator value="1">
                    <span />
                </RadioGroup.Indicator>
            </RadioGroup.Item>
        </RadioGroup>
    );
}
