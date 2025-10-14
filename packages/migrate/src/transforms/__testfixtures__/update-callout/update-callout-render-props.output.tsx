import { Callout } from '@vapor-ui/core';
import { HeartIcon } from '@vapor-ui/icons';

export const App = () => {
    return (
        <Callout.Root
            render={
                <div>
                    <Callout.Icon>
                        <HeartIcon />
                    </Callout.Icon>
                    Custom alert with asChild prop
                </div>
            }
        />
    );
};
