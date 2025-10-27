import { IconButton } from '@goorm-dev/vapor-core';
import { HeartIcon } from '@vapor-ui/icons';

export default function App() {
    return (
        <>
            <IconButton rounded={true} aria-label="heart">
                <HeartIcon />
            </IconButton>
        </>
    );
}
