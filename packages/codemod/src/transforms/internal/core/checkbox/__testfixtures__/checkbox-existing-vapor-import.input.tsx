import { Checkbox } from '@goorm-dev/vapor-core';
import { Button } from '@vapor-ui/core';

export const Component = () => (
    <div>
        <Button>Click</Button>
        <Checkbox>
            <Checkbox.Indicator />
        </Checkbox>
    </div>
);
