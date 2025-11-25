// @ts-nocheck
import { Alert } from '@goorm-dev/vapor-core';
import { Button } from '@vapor-ui/core';
import { CheckIcon } from '@vapor-ui/icons';

export const Component = () => (
    <>
        <Alert color="success">
            <CheckIcon />
            Success message
        </Alert>
        <Button>Click</Button>
    </>
);
