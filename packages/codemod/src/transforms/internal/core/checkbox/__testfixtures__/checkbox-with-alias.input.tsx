import { Checkbox as CoreCheckbox } from '@goorm-dev/vapor-core';

export const Component = () => (
    <CoreCheckbox id="agree">
        <CoreCheckbox.Indicator />
        <CoreCheckbox.Label>I agree</CoreCheckbox.Label>
    </CoreCheckbox>
);
