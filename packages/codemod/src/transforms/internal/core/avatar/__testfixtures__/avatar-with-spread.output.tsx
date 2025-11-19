import { Avatar } from '@vapor-ui/core';

function Component() {
    const props = { size: 'md' as const };
    return <Avatar.Root alt="User" {...props} shape="circle" />;
}
