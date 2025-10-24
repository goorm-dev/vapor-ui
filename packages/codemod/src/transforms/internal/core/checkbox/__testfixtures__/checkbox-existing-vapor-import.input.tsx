import { Text } from '@vapor-ui/core';
import { Checkbox } from '@goorm-dev/vapor-core';

export const Component = () => (
    <div>
        <Text>Select option:</Text>
        <Checkbox>
            <Checkbox.Indicator />
        </Checkbox>
    </div>
);
