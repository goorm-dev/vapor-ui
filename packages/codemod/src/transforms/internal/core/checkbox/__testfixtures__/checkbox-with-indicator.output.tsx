import { Checkbox } from '@vapor-ui/core';

export const Component = () => (
    <div>
        <Checkbox.Root id="terms">
            <Checkbox.Indicator />
        </Checkbox.Root>
        <label htmlFor="terms">Accept terms</label>
    </div>
);
