import { Avatar } from '@vapor-ui/core';

function Component() {
    const badge = <span>Badge</span>;
    return (
        <Avatar.Simple alt="User" size="md" shape="circle">
            {badge}
        </Avatar.Simple>
    );
}
