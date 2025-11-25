// @ts-nocheck
import { Avatar } from '@vapor-ui/core';

function Component({ isSquare }: { isSquare: boolean }) {
    return <Avatar.Root alt="User" shape={isSquare ? 'square' : 'circle'} />;
}
