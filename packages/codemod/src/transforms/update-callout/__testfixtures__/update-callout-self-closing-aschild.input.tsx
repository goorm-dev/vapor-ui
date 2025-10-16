// @ts-nocheck

import { Alert } from '@goorm-dev/vapor-core';

export const App = () => {
    return (
        <Alert asChild>
            <div>Alert with custom child</div>
        </Alert>
    );
};
