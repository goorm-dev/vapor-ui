import { Checkbox as CoreCheckbox } from '@vapor-ui/core';

export const Component = () => (
    <CoreCheckbox.Root id="agree">
        <CoreCheckbox.Indicator />
        {
            // TODO: Checkbox.Label removed - use standard HTML label element with htmlFor attribute
        }
        I agree
    </CoreCheckbox.Root>
);
