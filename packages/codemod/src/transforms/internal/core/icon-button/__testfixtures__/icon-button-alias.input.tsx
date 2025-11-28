// @ts-nocheck
import { IconButton as MyIconButton } from '@goorm-dev/vapor-core';
import { HeartIcon } from '@vapor-ui/icons';

export default function App() {
    return (
        <MyIconButton aria-label="heart" rounded={false}>
            <HeartIcon />
        </MyIconButton>
    );
}
