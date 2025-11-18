// @ts-nocheck
import { Avatar } from '@goorm-dev/vapor-core';

function Component({ isSquare }: { isSquare: boolean }) {
    return <Avatar label="User" square={isSquare} />;
}
