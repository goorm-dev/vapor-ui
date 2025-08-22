import { Avatar } from '@vapor-ui/core';

export default function DefaultAvatar() {
    return (
        <Avatar.Root size="md" alt="goorm" src="/icons/vapor-logo.png">
            <Avatar.Image />
            <Avatar.Fallback>goorm</Avatar.Fallback>
        </Avatar.Root>
    );
}
