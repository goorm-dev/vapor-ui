import { Checkbox } from '@vapor-ui/core';

export const Component = () => (
    <div>
        <Checkbox.Root id="terms">
            <Checkbox.Indicator />
            {
                // TODO: Checkbox.Label removed - use standard HTML label element with htmlFor attribute
            }
            Accept terms and conditions
        </Checkbox.Root>
    </div>
);
