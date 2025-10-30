import { Checkbox } from '@goorm-dev/vapor-core';

export const Component = () => (
    <Checkbox id="newsletter" defaultChecked>
        <Checkbox.Indicator />
        <Checkbox.Label className="custom-label" htmlFor="newsletter">
            Subscribe to our newsletter
        </Checkbox.Label>
    </Checkbox>
);
