// @ts-nocheck
import { Callout } from '@vapor-ui/core';
import { CloseOutlineIcon } from '@vapor-ui/icons';

export const Component = () => (
    <Callout.Root color="danger">
        <Callout.Icon>
            <CloseOutlineIcon />
        </Callout.Icon>
        Error occurred
    </Callout.Root>
);
