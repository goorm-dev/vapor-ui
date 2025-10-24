import { IconButton } from '@vapor-ui/core';
import { HeartIcon } from '@vapor-ui/icons';

export default function App() {
    const isRounded = true;
    return (
        <IconButton aria-label="heart" shape={isRounded ? 'circle' : 'square'}>
            <HeartIcon />
        </IconButton>
    );
}
