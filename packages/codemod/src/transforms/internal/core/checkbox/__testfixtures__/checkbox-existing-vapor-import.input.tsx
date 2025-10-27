import { Checkbox } from '@goorm-dev/vapor-core';
import { Text } from '@vapor-ui/core';

export const Component = () => (
    <div>
        <Text>Select option:</Text>
        <Checkbox>
            <Checkbox.Indicator />
        </Checkbox>
    </div>
);
