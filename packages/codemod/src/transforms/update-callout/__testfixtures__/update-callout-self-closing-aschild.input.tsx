import { Alert } from '@vapor-ui/core';

export const App = () => {
    return (
        <Alert asChild>
            <div>Alert with custom child</div>
        </Alert>
    );
};
