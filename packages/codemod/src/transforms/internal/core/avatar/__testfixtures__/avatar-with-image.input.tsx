// @ts-nocheck
import { Avatar } from '@goorm-dev/vapor-core';

function Component() {
    return (
        <Avatar label="John Doe" size="md" square={false}>
            <Avatar.Image src="/avatar.jpg" alt="John Doe" />
        </Avatar>
    );
}
