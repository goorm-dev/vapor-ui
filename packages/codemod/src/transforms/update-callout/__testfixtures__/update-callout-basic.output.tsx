import { HeartIcon } from '@vapor-ui/icons';
import { Callout } from '@vapor-ui/core';

export const App = () => {
    return (
        <Callout.Root>
            <Callout.Icon>
                <HeartIcon />
            </Callout.Icon>
            This is a basic alert message
        </Callout.Root>
    );
};
