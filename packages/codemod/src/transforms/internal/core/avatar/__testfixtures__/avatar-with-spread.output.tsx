import { Avatar } from '@vapor-ui/core';

function Component() {
    const props = { size: 'md' as const };
    return <Avatar.Simple alt="User" {...props} shape="circle" />;
}
