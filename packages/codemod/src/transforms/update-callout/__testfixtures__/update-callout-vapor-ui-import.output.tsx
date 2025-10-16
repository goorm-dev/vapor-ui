// @ts-nocheck

import { HeartIcon } from '@vapor-ui/icons';
import { Callout } from '@vapor-ui/core';

export const App = () => {
    return (
        <Callout.Root>
            <Callout.Icon>
                <HeartIcon />
            </Callout.Icon>
            This is an alert message
        </Callout.Root>
    );
};
