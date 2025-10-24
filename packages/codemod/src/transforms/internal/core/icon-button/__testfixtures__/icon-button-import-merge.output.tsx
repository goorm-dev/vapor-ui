import { Button, IconButton } from '@vapor-ui/core';
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
