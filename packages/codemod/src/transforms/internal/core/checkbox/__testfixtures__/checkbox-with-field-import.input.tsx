import { Checkbox } from '@goorm-dev/vapor-core';
import { Field } from '@vapor-ui/core';

export const Component = () => (
    <Checkbox id="terms">
        <Checkbox.Indicator />
        <Checkbox.Label>Accept terms</Checkbox.Label>
    </Checkbox>
);
