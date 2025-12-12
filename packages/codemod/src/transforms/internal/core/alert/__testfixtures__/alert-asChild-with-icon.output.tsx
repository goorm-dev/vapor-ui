import { Callout } from '@vapor-ui/core';
import { HeartIcon } from '@vapor-ui/icons';

export const Component = () => (
    <Callout.Root
        render={
            <div>
                <HeartIcon />
                Message with icon
            </div>
        }
        colorPalette="primary"
    />
);
