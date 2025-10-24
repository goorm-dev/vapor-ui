import { Avatar } from '@goorm-dev/vapor-core';

function Component() {
    return (
        <Avatar label="User" size="md">
            <Avatar.Image src="/avatar.jpg" />
            <span>Badge</span>
        </Avatar>
    );
}
