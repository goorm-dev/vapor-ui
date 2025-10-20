import { Callout } from '@vapor-ui/core';
import { CheckIcon } from '@vapor-ui/icons';

export const Component = () => (
    <Callout.Root color="success">
        <Callout.Icon>
            <CheckIcon />
        </Callout.Icon>
        Success operation completed
    </Callout.Root>
);
