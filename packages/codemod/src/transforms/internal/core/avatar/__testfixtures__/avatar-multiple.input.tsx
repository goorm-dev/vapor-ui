// @ts-nocheck
import { Avatar } from '@goorm-dev/vapor-core';

function Component() {
    return (
        <div>
            <Avatar label="User 1" size="sm" />
            <Avatar label="User 2" size="md" square={true} />
            <Avatar label="User 3" size="lg" square={false}>
                <Avatar.Image src="/user3.jpg" alt="User 3" />
            </Avatar>
        </div>
    );
}
