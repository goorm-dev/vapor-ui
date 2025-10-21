// @ts-nocheck
import { IconButton } from '@vapor-ui/core';
import { HeartIcon } from '@vapor-ui/icons';
export default function App() {
    const props = { color: 'primary', size: 'md' };
    return (
        <IconButton {...props} aria-label="heart">
            <HeartIcon />
        </IconButton>
    );
}
