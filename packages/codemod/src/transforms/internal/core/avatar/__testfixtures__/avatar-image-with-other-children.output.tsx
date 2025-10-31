import { Avatar } from '@vapor-ui/core';

function Component() {
    return (
        <Avatar.Simple alt="User" size="md" shape="circle" src="/avatar.jpg">
            <span>Badge</span>
        </Avatar.Simple>
    );
}
