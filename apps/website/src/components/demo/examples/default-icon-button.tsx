import { IconButton } from '@vapor-ui/core';
import { HeartIcon } from '@vapor-ui/icons';

export default function DefaultIconButton() {
    return (
        <IconButton aria-label="Like">
            <HeartIcon />
        </IconButton>
    );
}
