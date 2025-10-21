import { Checkbox } from '@vapor-ui/core';

export const Component = () => (
    <Checkbox.Root
        render={
            <button>
                <Checkbox.Indicator />
            </button>
        }
    />
);
