import { HeartIcon } from '@vapor-ui/icons';
import { Callout } from '@vapor-ui/core';

export const App = () => {
    return (
        <Callout.Root
            render={
                <div>
                    <HeartIcon />
                    Custom alert with asChild prop
                </div>
            }
        />
    );
};
