// @ts-nocheck
import { IconButton } from '@goorm-dev/vapor-core';
import { HeartIcon } from '@vapor-ui/icons';

export default function App() {
    return (
        <div>
            <IconButton icon={HeartIcon} aria-label="heart" />
            <IconButton iconClassName="custom-icon" aria-label="heart">
                <HeartIcon />
            </IconButton>
        </div>
    );
}
