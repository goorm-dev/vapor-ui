// @ts-nocheck
import { Callout } from '@vapor-ui/core';
import { CheckIcon } from '@vapor-ui/icons';

export const Component = () => (
    <Callout.Root
        render={
            <div>
                <CheckIcon />
                Message with icon
            </div>
        }
        color="primary"
    />
);
