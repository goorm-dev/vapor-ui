// @ts-nocheck
import { IconButton } from '@vapor-ui/core';
import { HeartIcon } from '@vapor-ui/icons';
export default function App() {
    return (
        <div>
            <IconButton aria-label="heart" />
            <IconButton aria-label="heart">
                <HeartIcon />
            </IconButton>
        </div>
    );
}
