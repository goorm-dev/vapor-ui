import { IconButton } from '@goorm-dev/vapor-core';
import { HeartIcon } from '@vapor-ui/icons';

export default function App() {
    return (
        <div>
            <IconButton shape="fill" aria-label="heart">
                <HeartIcon />
            </IconButton>
            <IconButton shape="outline" aria-label="heart">
                <HeartIcon />
            </IconButton>
            <IconButton shape="invisible" aria-label="heart">
                <HeartIcon />
            </IconButton>
        </div>
    );
}
