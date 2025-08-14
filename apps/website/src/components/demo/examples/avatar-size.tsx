import { Avatar } from '@vapor-ui/core';

export default function AvatarSize() {
    return (
        <div className="flex flex-wrap items-center gap-4">
            <Avatar.Root size="sm" alt="goorm" src="/icons/vapor-logo.png">
                <Avatar.Image />
                <Avatar.Fallback>SM</Avatar.Fallback>
            </Avatar.Root>
            <Avatar.Root size="md" alt="goorm" src="/icons/vapor-logo.png">
                <Avatar.Image />
                <Avatar.Fallback>MD</Avatar.Fallback>
            </Avatar.Root>
            <Avatar.Root size="lg" alt="goorm" src="/icons/vapor-logo.png">
                <Avatar.Image />
                <Avatar.Fallback>LG</Avatar.Fallback>
            </Avatar.Root>
            <Avatar.Root size="xl" alt="goorm" src="/icons/vapor-logo.png">
                <Avatar.Image />
                <Avatar.Fallback>XL</Avatar.Fallback>
            </Avatar.Root>
        </div>
    );
}
