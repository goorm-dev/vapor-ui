import { IconButton } from '@vapor-ui/core';
import { HeartIcon } from '@vapor-ui/icons';

export default function App() {
    return (
        <div>
            <IconButton colorPalette="primary" aria-label="heart">
                <HeartIcon />
            </IconButton>
            <IconButton colorPalette="secondary" aria-label="heart">
                <HeartIcon />
            </IconButton>
        </div>
    );
}
