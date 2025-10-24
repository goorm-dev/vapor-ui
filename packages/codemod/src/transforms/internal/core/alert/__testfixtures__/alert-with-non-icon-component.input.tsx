// @ts-nocheck
import { Alert } from '@goorm-dev/vapor-core';

import { Badge } from '@vapor-ui/core';

export const Component = () => (
    <Alert color="primary">
        <Badge>New</Badge>
        Message with badge
    </Alert>
);
