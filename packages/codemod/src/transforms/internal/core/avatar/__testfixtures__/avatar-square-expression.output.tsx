// @ts-nocheck
import { Avatar } from '@vapor-ui/core';

function Component({ isSquare }: { isSquare: boolean }) {
    return <Avatar.Simple alt="User" shape={isSquare ? 'square' : 'circle'} />;
}
