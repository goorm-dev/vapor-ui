// @ts-nocheck

import { Alert, Button, Card } from '@goorm-dev/vapor-core';
import { HeartIcon } from '@vapor-ui/icons';

export const App = () => {
    return (
        <div>
            <Alert>
                <HeartIcon />
                This is an alert message
            </Alert>
            <Button>Click me</Button>
            <Card>Card content</Card>
        </div>
    );
};
