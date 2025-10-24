import { Checkbox } from '@goorm-dev/vapor-core';

export const Component = () => (
    <Checkbox asChild size="lg" disabled>
        <button type="button" className="custom-button">
            <Checkbox.Indicator />
        </button>
    </Checkbox>
);
