// @ts-nocheck
import { IconButton } from '@goorm-dev/vapor-core';
import { HeartIcon } from '@vapor-ui/icons';

export default function App() {
    const Icon = HeartIcon;
    return (
        <div>
            <IconButton icon={HeartIcon} aria-label="heart" />
            <IconButton icon={Icon} aria-label="heart" />
            <IconButton iconClassName="custom-icon" aria-label="heart">
                <HeartIcon />
            </IconButton>
        </div>
    );
}
