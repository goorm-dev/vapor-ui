import { IconButton as MyIconButton } from '@vapor-ui/core';
import { HeartIcon } from '@vapor-ui/icons';

export default function App() {
    return (
        <MyIconButton aria-label="heart" shape="square">
            <HeartIcon />
        </MyIconButton>
    );
}
