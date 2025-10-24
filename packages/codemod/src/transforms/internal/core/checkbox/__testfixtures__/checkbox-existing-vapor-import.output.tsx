import { Text, Checkbox } from '@vapor-ui/core';

export const Component = () => (
    <div>
        <Text>Select option:</Text>
        <Checkbox.Root>
            <Checkbox.Indicator />
        </Checkbox.Root>
    </div>
);
