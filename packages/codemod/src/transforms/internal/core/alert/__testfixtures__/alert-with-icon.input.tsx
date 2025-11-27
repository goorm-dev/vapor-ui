// @ts-nocheck
import { Alert as MyAlert } from '@goorm-dev/vapor-core';
import { CheckIcon } from '@vapor-ui/icons';

export const Component = () => (
    <MyAlert color="success">
        <CheckIcon />
        Success operation completed
    </MyAlert>
);
