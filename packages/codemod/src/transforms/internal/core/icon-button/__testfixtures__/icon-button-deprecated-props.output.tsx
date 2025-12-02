// @ts-nocheck
import { IconButton } from '@vapor-ui/core';
import { HeartIcon } from '@vapor-ui/icons';

export default function App() {
    const Icon = HeartIcon;
    return (
        <div>
            <IconButton aria-label="heart">
                <HeartIcon />
            </IconButton>
            <IconButton aria-label="heart">
                <Icon />
            </IconButton>
            <IconButton aria-label="heart">
                <HeartIcon />
            </IconButton>
        </div>
    );
}
