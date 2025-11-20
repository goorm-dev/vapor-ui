import { Checkbox } from '@goorm-dev/vapor-core';

export const Component = () => {
    const props = { size: 'md' };
    return (
        <Checkbox {...props}>
            <Checkbox.Indicator />
        </Checkbox>
    );
};
