import { Checkbox } from '@goorm-dev/vapor-core';

export const Component = () => (
    <Checkbox>
        <Checkbox.Indicator>
            <span>Custom indicator</span>
        </Checkbox.Indicator>
    </Checkbox>
);
