import { Checkbox } from '@vapor-ui/core';

export const Component = () => (
    <div className="flex items-center gap-2">
        <Checkbox.Root id="newsletter" defaultChecked>
            <Checkbox.Indicator />
        </Checkbox.Root>
        <label htmlFor="newsletter">Subscribe to newsletter</label>
    </div>
);
