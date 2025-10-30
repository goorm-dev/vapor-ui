import { Checkbox } from '@goorm-dev/vapor-core';

export const Component = () => (
    <div>
        <Checkbox id="terms">
            <Checkbox.Indicator />
            <Checkbox.Label>Accept terms and conditions</Checkbox.Label>
        </Checkbox>
    </div>
);
