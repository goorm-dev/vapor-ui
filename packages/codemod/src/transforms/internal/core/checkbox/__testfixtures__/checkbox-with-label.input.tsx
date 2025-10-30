import { Checkbox } from '@goorm-dev/vapor-core';

export const Component = () => (
    <div className="flex items-center gap-2">
        <Checkbox id="newsletter" defaultChecked>
            <Checkbox.Indicator />
        </Checkbox>
        <label htmlFor="newsletter">Subscribe to newsletter</label>
    </div>
);
