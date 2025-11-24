import { Callout as MyAlert } from '@vapor-ui/core';
import { HeartIcon } from '@vapor-ui/icons';

export const Component = () => (
    <MyAlert.Root colorPalette="success">
        <MyAlert.Icon>
            <HeartIcon />
        </MyAlert.Icon>
        Success operation completed
    </MyAlert.Root>
);
