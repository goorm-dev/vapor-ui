import { IconButton } from '@goorm-dev/vapor-core';
import { HeartIcon } from '@vapor-ui/icons';

export default function App() {
    return (
        <IconButton rounded={false} aria-label="heart">
            <HeartIcon />
        </IconButton>
    );
}
