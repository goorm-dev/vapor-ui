// @ts-nocheck
import React from 'react';

import { RadioGroup } from '@goorm-dev/vapor-core';

export function Example() {
    return (
        <div>
            <h1>Select an option</h1>
            <RadioGroup selectedValue="1">
                <RadioGroup.Item>
                    <RadioGroup.Indicator value="1" />
                    <RadioGroup.Label>Option 1</RadioGroup.Label>
                </RadioGroup.Item>
                <RadioGroup.Item>
                    <RadioGroup.Indicator value="2" />
                    <RadioGroup.Label>Option 2</RadioGroup.Label>
                </RadioGroup.Item>
            </RadioGroup>
            <button>Submit</button>
        </div>
    );
}
