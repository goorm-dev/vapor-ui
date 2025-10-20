import { Checkbox } from '@vapor-ui/core';

export const Component = () => (
    <Checkbox.Root id="newsletter" defaultChecked>
        <Checkbox.Indicator />
        {
            // TODO: Checkbox.Label removed - use standard HTML label element with htmlFor attribute
        }
        Subscribe to our newsletter
    </Checkbox.Root>
);
