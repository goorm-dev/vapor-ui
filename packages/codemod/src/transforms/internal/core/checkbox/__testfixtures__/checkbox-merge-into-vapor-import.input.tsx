import { Checkbox, Button } from '@goorm-dev/vapor-core';
import { Text } from '@vapor-ui/core';

export const Component = () => (
    <div>
        <Text>Form</Text>
        <Checkbox>
            <Checkbox.Indicator />
        </Checkbox>
        <Button>Submit</Button>
    </div>
);
