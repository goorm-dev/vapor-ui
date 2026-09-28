import { Toggle } from '@vapor-ui/core';
import { HeartIcon } from '@vapor-ui/icons';

export default function DefaultToggle() {
    return (
        <Toggle aria-label="즐겨찾기">
            <HeartIcon />
        </Toggle>
    );
}
