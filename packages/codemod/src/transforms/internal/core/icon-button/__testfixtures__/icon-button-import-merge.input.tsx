import { Button } from '@vapor-ui/core';
import { IconButton } from '@goorm-dev/vapor-core';
import { HeartIcon } from '@vapor-ui/icons';

export default function App() {
    return (
        <div>
            <Button>Click me</Button>
            <IconButton aria-label="heart">
                <HeartIcon />
            </IconButton>
        </div>
    );
}
