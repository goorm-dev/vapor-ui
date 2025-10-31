// @ts-nocheck
import React from 'react';

import { RadioGroup } from '@goorm-dev/vapor-core';

export function Example() {
    return (
        <RadioGroup value="1">
            <RadioGroup.Item>
                <div>Some other content</div>
            </RadioGroup.Item>
        </RadioGroup>
    );
}
