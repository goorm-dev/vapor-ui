import { Button } from '@goorm-dev/vapor-core';
import { Checkbox, Text } from '@vapor-ui/core';

export const Component = () => (
    <div>
        <Text>Form</Text>
        <Checkbox.Root>
            <Checkbox.Indicator />
        </Checkbox.Root>
        <Button>Submit</Button>
    </div>
);
