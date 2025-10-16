import { Callout } from '@vapor-ui/core';
import { HeartIcon } from '@vapor-ui/icons';

export const App = () => {
    return (
        <Alert asChild>
            <div>
                <HeartIcon />
                Custom alert with asChild prop
            </div>
        </Alert>
    );
};
