import { IconButton } from '@vapor-ui/core';
import { HeartIcon } from '@vapor-ui/icons';

export default function App() {
    return (
        <div>
            <IconButton variant="fill" aria-label="heart">
                <HeartIcon />
            </IconButton>
            <IconButton variant="outline" aria-label="heart">
                <HeartIcon />
            </IconButton>
            <IconButton variant="ghost" aria-label="heart">
                <HeartIcon />
            </IconButton>
        </div>
    );
}
