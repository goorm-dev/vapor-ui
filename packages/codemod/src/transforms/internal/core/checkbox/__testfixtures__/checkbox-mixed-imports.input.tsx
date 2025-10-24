import { Checkbox, Button, Badge } from '@goorm-dev/vapor-core';

export const Component = () => (
    <div>
        <Button>Click me</Button>
        <Checkbox>
            <Checkbox.Indicator />
        </Checkbox>
        <Badge>New</Badge>
    </div>
);
