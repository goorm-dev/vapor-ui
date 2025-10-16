// @ts-nocheck

import { Alert } from '@goorm-dev/vapor-core';
import { WarningIcon } from '@vapor-ui/icons';

export const App = () => {
    const message = 'Dynamic message';
    return (
        <Alert>
            <WarningIcon />
            {message}
        </Alert>
    );
};
