// @ts-nocheck

import { Button, Card } from '@goorm-dev/vapor-core';
import { HeartIcon } from '@vapor-ui/icons';

import { Callout } from '@vapor-ui/core';

export const App = () => {
    return (
        <div>
            <Callout.Root>
                <Callout.Icon>
                    <HeartIcon />
                </Callout.Icon>
                This is an alert message
            </Callout.Root>
            <Button>Click me</Button>
            <Card>Card content</Card>
        </div>
    );
};
