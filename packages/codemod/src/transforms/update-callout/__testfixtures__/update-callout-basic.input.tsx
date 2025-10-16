import { Alert } from '@vapor-ui/core';
import { InfoIcon } from '@vapor-ui/icons';

export const App = () => {
    return (
        <Alert>
            <InfoIcon />
            This is a basic alert message
        </Alert>
    );
};
