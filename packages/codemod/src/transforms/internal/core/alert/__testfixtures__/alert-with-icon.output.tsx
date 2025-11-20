// @ts-nocheck
import { Callout as MyAlert } from '@vapor-ui/core';
import { CheckIcon } from '@vapor-ui/icons';

export const Component = () => (
    <MyAlert.Root color="success">
        <MyAlert.Icon>
            <CheckIcon />
        </MyAlert.Icon>
        Success operation completed
    </MyAlert.Root>
);
