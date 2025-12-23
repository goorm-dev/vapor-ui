import { Checkbox } from '@vapor-ui/core';

export const Component = () => {
    const props = { size: 'md' };
    return (
        <Checkbox.Root {...props}>
            <Checkbox.IndicatorPrimitive />
        </Checkbox.Root>
    );
};
