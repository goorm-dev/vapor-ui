import { Checkbox } from '@vapor-ui/core';

export const Component = () => (
    <Checkbox.Root render={<button type="button" className="custom-button" />} size="lg" disabled>
        <Checkbox.Indicator />
    </Checkbox.Root>
);
