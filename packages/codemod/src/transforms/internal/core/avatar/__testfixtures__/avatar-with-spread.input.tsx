import { Avatar } from '@goorm-dev/vapor-core';

function Component() {
    const props = { size: 'md' as const };
    return <Avatar label="User" {...props} />;
}
