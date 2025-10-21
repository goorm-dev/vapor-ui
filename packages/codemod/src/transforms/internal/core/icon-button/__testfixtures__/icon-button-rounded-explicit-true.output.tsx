import { IconButton } from '@vapor-ui/core';
import { HeartIcon } from '@vapor-ui/icons';
export default function App() {
    return (
        <>
            <IconButton aria-label="heart" shape="circle">
                <HeartIcon />
            </IconButton>
        </>
    );
}
