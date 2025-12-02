// @ts-nocheck
import { IconButton } from '@goorm-dev/vapor-core';
import { HeartIcon } from '@vapor-ui/icons';

const isRounded = true;
const props = {};

export default function App() {
    return (
        <div>
            {/* Line 82: JSXSpreadAttribute */}
            <IconButton {...props} aria-label="spread" />
            {/* Line 86: Non-JSXIdentifier name */}
            <IconButton aria-label="test" />
            {/* Line 132: hint color warning */}
            <IconButton aria-label="hint" color="hint">
                <HeartIcon />
            </IconButton>
            {/* Line 143-144: icon prop conversion */}
            <IconButton aria-label="icon-prop" icon={HeartIcon} />
            {/* Line 164: icon prop fallback removed - JSX in props not supported */}
            {/* Line 180-212: rounded variations */}
            <IconButton aria-label="rounded-true" rounded={true}>
                <HeartIcon />
            </IconButton>
            <IconButton aria-label="rounded-false" rounded={false}>
                <HeartIcon />
            </IconButton>
            <IconButton aria-label="rounded-var" rounded={isRounded}>
                <HeartIcon />
            </IconButton>
            <IconButton aria-label="rounded-no-value" rounded>
                <HeartIcon />
            </IconButton>
        </div>
    );
}
