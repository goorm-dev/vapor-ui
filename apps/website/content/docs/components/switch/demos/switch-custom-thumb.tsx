import { Switch } from '@vapor-ui/core';
import { HeartIcon } from '@vapor-ui/icons';

export default function SwitchCustomThumb() {
    return (
        <Switch.Root>
            <Switch.ThumbPrimitive>
                <HeartIcon />
            </Switch.ThumbPrimitive>
        </Switch.Root>
    );
}
