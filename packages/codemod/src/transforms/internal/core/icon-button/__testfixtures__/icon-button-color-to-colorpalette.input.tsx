import { IconButton } from '@goorm-dev/vapor-core';
import { HeartIcon } from '@vapor-ui/icons';

export default function App() {
    return (
        <div>
            <IconButton color="primary" aria-label="heart">
                <HeartIcon />
            </IconButton>
            <IconButton color="secondary" aria-label="heart">
                <HeartIcon />
            </IconButton>
        </div>
    );
}
