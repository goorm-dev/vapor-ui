import { Avatar } from '@goorm-dev/vapor-core';

function Component() {
    const badge = <span>Badge</span>;
    return (
        <Avatar label="User" size="md">
            {badge}
        </Avatar>
    );
}
