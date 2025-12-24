// @ts-nocheck
import { Alert as MyAlert } from '@goorm-dev/vapor-core';
import { HeartIcon } from '@vapor-ui/icons';

export const Component = () => (
    <MyAlert color="success">
        <HeartIcon />
        Success operation completed
    </MyAlert>
);
