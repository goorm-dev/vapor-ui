// @ts-nocheck

import { Callout } from '@vapor-ui/core';
import { CheckIcon } from '@vapor-ui/icons';

export const Component = () => (
    <Callout.Root render={<div />} color="primary">
        <Callout.Icon>
            <CheckIcon />
        </Callout.Icon>
        Message with icon
    </Callout.Root>
);
