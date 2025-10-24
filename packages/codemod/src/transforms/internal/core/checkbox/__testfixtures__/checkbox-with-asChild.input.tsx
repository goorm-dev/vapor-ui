import { Checkbox } from '@goorm-dev/vapor-core';

export const Component = () => (
    <Checkbox asChild>
        <button>
            <Checkbox.Indicator />
        </button>
    </Checkbox>
);
