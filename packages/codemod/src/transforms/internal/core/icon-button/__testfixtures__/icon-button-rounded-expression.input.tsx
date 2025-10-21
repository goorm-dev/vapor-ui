import { IconButton } from '@goorm-dev/vapor-core';
import { HeartIcon } from '@vapor-ui/icons';

export default function App() {
    const isRounded = true;
    return (
        <IconButton rounded={isRounded} aria-label="heart">
            <HeartIcon />
        </IconButton>
    );
}
