import { Checkbox } from '@goorm-dev/vapor-core';

export const Component = () => (
    <div>
        <Checkbox id="terms">
            <Checkbox.Indicator />
        </Checkbox>
        <label htmlFor="terms">Accept terms</label>
    </div>
);
