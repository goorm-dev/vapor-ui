// @ts-nocheck
import { Avatar } from '@vapor-ui/core';

function Component() {
    return (
        <div>
            <Avatar.Simple alt="User 1" size="sm" shape="circle" />
            <Avatar.Simple alt="User 2" size="md" shape="square" />
            <Avatar.Simple alt="User 3" size="lg" shape="circle" src="/user3.jpg" />
        </div>
    );
}
