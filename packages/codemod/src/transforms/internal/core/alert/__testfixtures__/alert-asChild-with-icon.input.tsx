// @ts-nocheck
import { Alert } from '@goorm-dev/vapor-core';
import { HeartIcon } from '@vapor-ui/icons';

export const Component = () => (
    <Alert asChild color="primary">
        <div>
            <HeartIcon />
            Message with icon
        </div>
    </Alert>
);
