import { IconButton } from '@vapor-ui/core';
import { HeartIcon } from '@vapor-ui/icons';

export default function App() {
    return (
        <div>
            <IconButton size="md" color="primary" variant="fill" aria-label="heart">
                <HeartIcon />
            </IconButton>
            <IconButton size="lg" color="secondary" variant="outline" disabled aria-label="edit">
                <HeartIcon />
            </IconButton>
        </div>
    );
}
