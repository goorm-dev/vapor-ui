// @ts-nocheck
import { Alert } from '@goorm-dev/vapor-core';
import { CheckIcon } from '@vapor-ui/icons';

export const Component = () => (
    <Alert color="success">
        <CheckIcon />
        Success operation completed
    </Alert>
);
