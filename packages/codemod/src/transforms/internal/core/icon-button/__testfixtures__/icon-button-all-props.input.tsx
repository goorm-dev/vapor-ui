import { IconButton } from '@goorm-dev/vapor-core';
import { HeartIcon } from '@vapor-ui/icons';

export default function App() {
    return (
        <div>
            <IconButton size="md" color="primary" rounded={true} shape="fill" aria-label="heart">
                <HeartIcon />
            </IconButton>
            <IconButton
                size="lg"
                color="secondary"
                rounded={false}
                shape="outline"
                disabled
                aria-label="edit"
            >
                <HeartIcon />
            </IconButton>
        </div>
    );
}
