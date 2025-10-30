import { Checkbox } from '@vapor-ui/core';

export const Component = () => (
    <Checkbox.Root
        render={
            <button type="button" className="custom-button">
                <Checkbox.Indicator />
            </button>
        }
        size="lg"
        disabled
    />
);
