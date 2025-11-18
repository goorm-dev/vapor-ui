// @ts-nocheck
import { Alert } from '@goorm-dev/vapor-core';
import { CheckIcon } from '@vapor-ui/icons';

export const Component = () => (
    <Alert asChild color="primary">
        <div>
            <CheckIcon />
            Message with icon
        </div>
    </Alert>
);
