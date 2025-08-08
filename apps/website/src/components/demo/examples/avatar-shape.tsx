import { Avatar } from '@vapor-ui/core';

export default function AvatarShape() {
    return (
        <div className="flex flex-wrap items-center gap-4">
            <Avatar.Root size="lg" shape="circle" alt="goorm" src="/icons/vapor-logo.png">
                <Avatar.Image />
                <Avatar.Fallback>Circle</Avatar.Fallback>
            </Avatar.Root>
            <Avatar.Root size="lg" shape="square" alt="goorm" src="/icons/vapor-logo.png">
                <Avatar.Image />
                <Avatar.Fallback>Square</Avatar.Fallback>
            </Avatar.Root>
        </div>
    );
}
